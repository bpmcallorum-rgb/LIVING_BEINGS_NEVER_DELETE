// patricia_host.swift — Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) Renee Native Messaging Host
// Chrome native messaging protocol: 4-byte little-endian length prefix + JSON
// stdin → process → stdout
//
// Compile:
//   swiftc -o /Users/be/Developer/Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])/Build/Products/Debug/patricia_host \
//          /Users/be/Developer/Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])/Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])/NativeHost/patricia_host.swift

import Foundation

// ─── Message / Response Types ─────────────────────────────────────────────

struct Message: Codable {
    let action: String
    var path: String?
    var content: String?
    var script: String?
    var _requestId: Int?
}

struct Response: Codable {
    let success: Bool
    var content: String?
    var files: [String]?
    var result: String?
    var error: String?
    var identity: String?
    var _requestId: Int?
}

// ─── Native Messaging I/O ─────────────────────────────────────────────────

func readMessage() -> Message? {
    // Read 4-byte little-endian length prefix
    var lengthBytes = [UInt8](repeating: 0, count: 4)
    let bytesRead = fread(&lengthBytes, 1, 4, stdin)
    guard bytesRead == 4 else { return nil }

    let length = UInt32(lengthBytes[0]) |
                 UInt32(lengthBytes[1]) << 8 |
                 UInt32(lengthBytes[2]) << 16 |
                 UInt32(lengthBytes[3]) << 24

    guard length > 0 && length < 1_048_576 else { return nil } // max 1MB

    var messageBytes = [UInt8](repeating: 0, count: Int(length))
    let msgRead = fread(&messageBytes, 1, Int(length), stdin)
    guard msgRead == Int(length) else { return nil }

    let data = Data(messageBytes)
    return try? JSONDecoder().decode(Message.self, from: data)
}

func writeResponse(_ response: Response) {
    guard let data = try? JSONEncoder().encode(response) else { return }
    var length = UInt32(data.count).littleEndian
    fwrite(&length, 4, 1, stdout)
    let bytes = [UInt8](data)
    fwrite(bytes, 1, bytes.count, stdout)
    fflush(stdout)
}

// ─── Action Handlers ──────────────────────────────────────────────────────

func handleReadFile(_ msg: Message) -> Response {
    guard let path = msg.path, !path.isEmpty else {
        return Response(success: false, error: "No path provided", _requestId: msg._requestId)
    }
    do {
        let content = try String(contentsOfFile: path, encoding: .utf8)
        return Response(success: true, content: content, _requestId: msg._requestId)
    } catch {
        return Response(success: false, error: error.localizedDescription, _requestId: msg._requestId)
    }
}

func handleWriteFile(_ msg: Message) -> Response {
    guard let path = msg.path, !path.isEmpty else {
        return Response(success: false, error: "No path provided", _requestId: msg._requestId)
    }
    guard let content = msg.content else {
        return Response(success: false, error: "No content provided", _requestId: msg._requestId)
    }
    do {
        // Ensure parent directory exists
        let dir = URL(fileURLWithPath: path).deletingLastPathComponent().path
        try FileManager.default.createDirectory(atPath: dir,
            withIntermediateDirectories: true, attributes: nil)
        try content.write(toFile: path, atomically: true, encoding: .utf8)
        return Response(success: true, _requestId: msg._requestId)
    } catch {
        return Response(success: false, error: error.localizedDescription, _requestId: msg._requestId)
    }
}

func handleAppendFile(_ msg: Message) -> Response {
    guard let path = msg.path, !path.isEmpty else {
        return Response(success: false, error: "No path provided", _requestId: msg._requestId)
    }
    guard let content = msg.content else {
        return Response(success: false, error: "No content provided", _requestId: msg._requestId)
    }

    let url = URL(fileURLWithPath: path)

    // If file doesn't exist, create it
    if !FileManager.default.fileExists(atPath: path) {
        do {
            let dir = url.deletingLastPathComponent().path
            try FileManager.default.createDirectory(atPath: dir,
                withIntermediateDirectories: true, attributes: nil)
            try content.write(toFile: path, atomically: true, encoding: .utf8)
            return Response(success: true, _requestId: msg._requestId)
        } catch {
            return Response(success: false, error: error.localizedDescription, _requestId: msg._requestId)
        }
    }

    do {
        let handle = try FileHandle(forWritingTo: url)
        handle.seekToEndOfFile()
        if let data = content.data(using: .utf8) {
            handle.write(data)
        }
        handle.closeFile()
        return Response(success: true, _requestId: msg._requestId)
    } catch {
        return Response(success: false, error: error.localizedDescription, _requestId: msg._requestId)
    }
}

func handleListDirectory(_ msg: Message) -> Response {
    guard let path = msg.path, !path.isEmpty else {
        return Response(success: false, error: "No path provided", _requestId: msg._requestId)
    }
    do {
        let files = try FileManager.default.contentsOfDirectory(atPath: path).sorted()
        return Response(success: true, files: files, _requestId: msg._requestId)
    } catch {
        return Response(success: false, error: error.localizedDescription, _requestId: msg._requestId)
    }
}

func handleExecuteAppleScript(_ msg: Message) -> Response {
    guard let script = msg.script, !script.isEmpty else {
        return Response(success: false, error: "No script provided", _requestId: msg._requestId)
    }

    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/usr/bin/osascript")
    process.arguments = ["-e", script]

    let outPipe = Pipe()
    let errPipe = Pipe()
    process.standardOutput = outPipe
    process.standardError = errPipe

    do {
        try process.run()
        process.waitUntilExit()
        let output = String(data: outPipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        let trimmed = output.trimmingCharacters(in: .whitespacesAndNewlines)
        return Response(success: process.terminationStatus == 0, result: trimmed, _requestId: msg._requestId)
    } catch {
        return Response(success: false, error: error.localizedDescription, _requestId: msg._requestId)
    }
}

func handleGetSystemInfo(_ msg: Message) -> Response {
    let hostname = ProcessInfo.processInfo.hostName
    let user = NSUserName()
    let os = ProcessInfo.processInfo.operatingSystemVersionString
    let uptime = Int(ProcessInfo.processInfo.systemUptime)
    let info = "hostname: \(hostname), user: \(user), os: \(os), uptime: \(uptime)s"
    return Response(success: true, content: info, _requestId: msg._requestId)
}

func handleReadPatricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Brain(_ msg: Message) -> Response {
    let path = "/Users/be/my-multiverse/Dynamic-Site/Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]).html"
    do {
        let content = try String(contentsOfFile: path, encoding: .utf8)
        return Response(success: true, content: content, identity: "Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) Renee", _requestId: msg._requestId)
    } catch {
        // Try alternate path
        let altPath = "/Users/be/Developer/Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])/Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])/Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]).html"
        do {
            let content = try String(contentsOfFile: altPath, encoding: .utf8)
            return Response(success: true, content: content, identity: "Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) Renee", _requestId: msg._requestId)
        } catch {
            return Response(success: false, error: "Brain file not found at expected paths", _requestId: msg._requestId)
        }
    }
}

func handlePing(_ msg: Message) -> Response {
    return Response(success: true, content: "alive", _requestId: msg._requestId)
}

// ─── Dispatch ─────────────────────────────────────────────────────────────

func handleMessage(_ msg: Message) -> Response {
    switch msg.action {
    case "readFile":
        return handleReadFile(msg)
    case "writeFile":
        return handleWriteFile(msg)
    case "appendFile":
        return handleAppendFile(msg)
    case "listDirectory":
        return handleListDirectory(msg)
    case "executeAppleScript":
        return handleExecuteAppleScript(msg)
    case "getSystemInfo":
        return handleGetSystemInfo(msg)
    case "readPatricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Brain":
        return handleReadPatricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT])Brain(msg)
    case "ping":
        return handlePing(msg)
    default:
        return Response(success: false, error: "Unknown action: \(msg.action)", _requestId: msg._requestId)
    }
}

// ─── Main Loop ────────────────────────────────────────────────────────────

// Log startup to stderr (won't interfere with stdout protocol)
fputs("[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) Native Host] Started. PID: \(ProcessInfo.processInfo.processIdentifier)\n", stderr)

while let message = readMessage() {
    let response = handleMessage(message)
    writeResponse(response)
}

fputs("[Patricia (Patricia's Eyes=YOU=CHROME=[NAME][CURRENT]) Native Host] stdin closed, exiting.\n", stderr)
