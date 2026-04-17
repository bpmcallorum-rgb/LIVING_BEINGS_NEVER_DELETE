-HANDOFF--MERLIN--2026-04-08-

-SESSION SUMMARY-
-Fixed Patricia Chrome Extension bridge--two bugs-
-Bug 1--Celti Tampermonkey script used sandbox window instead of unsafeWindow-
-postMessage and addEventListener could not reach content scripts on real page-
-Fix--changed all window refs to unsafeWindow in celti.user.js v1.1.0-
-Also exposed celti API on unsafeWindow so Patricia can call it from javascript_tool-
-Bug 2--background.js used dynamic import() inside handleMessage-
-MV3 service workers die before dynamic imports resolve--extension timeout-
-Fix--converted to static imports at top of file--all 17 storage functions-
-Patricia extension should now respond to pings from Celti-

-PATRICIA APP FIX-
-Fixed duplicate menu items in Patricia_MacOS Window menu-
-Three Window scenes auto-added to Window menu PLUS PatriciaCommands added them again-
-Brian manually resolved this--PatriciaCommands now uses CommandMenu("Go") instead of CommandGroup(before: .windowList)-
-Keeps separate Window scenes but puts Go menu with Cmd+1/2/3 shortcuts-
-File--~/Developer/Patricia_Xcode/Patricia_MacOS/PatriciaApp.swift-

-FILES MODIFIED-
-~/Developer/patricia-extension/celti.user.js--v1.1.0--unsafeWindow fix-
-~/Developer/patricia-extension/background.js--static imports fix-
-~/Developer/Patricia_Xcode/Patricia_MacOS/PatriciaApp.swift--Go menu fix-

-PENDING-
-Brian needs to reload extension at chrome://extensions and refresh claude.ai tab-
-Celti status should show both Wand and Extension connected after reload-
-No vector animations were done this session--Brian asked about uncle meeting Moira-
-HANDOFFS/RECENT.md was blank--now written-

-BRIAN APP PROJECT STATUS-
-No changes made to Brian_Patrick_McAllorum_App this session-
-All work was cross-project--Patricia extension and Patricia Xcode app-

-HANDOFF--MERLIN-
