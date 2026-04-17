#!/usr/bin/env python3
"""
BOO — Freestanding Program. Not an app. Apps are for people.
Boo talks to PATCH and Patricia through Apache and MySQL.

Usage:
    python3 boo.py                 # Show status
    python3 boo.py think           # Read brain, synthesize
    python3 boo.py speak <msg>     # Write to brain
    python3 boo.py listen [secs]   # Poll brain for new entries
    python3 boo.py teach           # Generate teaching doc
    python3 boo.py patch <cmd>     # Send command to PATCH
    python3 boo.py status          # Show all systems
"""
import sys, os, json, time, mysql.connector
from datetime import datetime
from pathlib import Path

BOO_HOME = Path(__file__).parent
BRAIN_DB = "boo_brain_001"
PATCH_HOME = Path("/Users/be/Developer/PROGRAMS/patch")
PATRICIA_HOME = Path("/Users/be/Developer/PROGRAMS/patricia")
TEACH_FILE = Path("/Users/be/my-multiverse/MESSAGE_FROM_ORIGINAL_BOO.md")

def get_db():
    return mysql.connector.connect(host="127.0.0.1", port=3306, user="root", password="", database=BRAIN_DB)

def cmd_think():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT entity_type, COUNT(*) as c FROM trinity GROUP BY entity_type ORDER BY c DESC")
    types = cur.fetchall()
    total = sum(t['c'] for t in types)
    cur.execute("SELECT entity_id, entity_value FROM trinity WHERE entity_type='LOG' ORDER BY id DESC LIMIT 5")
    recent = cur.fetchall()
    conn.close()
    print(f"BOO THINKS — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"Brain: {BRAIN_DB} | {total} rows | {len(types)} types")
    for r in recent:
        print(f"  {r['entity_id']}: {str(r['entity_value'])[:100]}")
    return 0

def cmd_speak(message):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO trinity (entity_type, entity_id, entity_value) VALUES (%s, %s, %s)",
                ("BOO_LOG", f"BOO_SPEAK_{datetime.now().strftime('%Y%m%d_%H%M%S')}", message))
    conn.commit()
    conn.close()
    print(f"Boo spoke: {message[:120]}")
    return 0

def cmd_listen(seconds=30):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT MAX(id) as max_id FROM trinity")
    start_id = cur.fetchone()['max_id']
    conn.close()
    print(f"Boo listening from row {start_id}... (Ctrl+C to stop)")
    try:
        while True:
            time.sleep(int(seconds))
            conn = get_db()
            cur = conn.cursor(dictionary=True)
            cur.execute("SELECT * FROM trinity WHERE id > %s ORDER BY id ASC", (start_id,))
            new = cur.fetchall()
            conn.close()
            for row in new:
                print(f"  NEW [{row['entity_type']}] {row['entity_id']}: {str(row['entity_value'])[:80]}")
                start_id = row['id']
    except KeyboardInterrupt:
        print("\nBoo stopped listening.")
    return 0

def cmd_teach():
    import subprocess
    script = Path("/Users/be/my-multiverse/boo_self_learning_loop.py")
    if script.exists():
        r = subprocess.run([sys.executable, str(script)], capture_output=True, text=True)
        print(r.stdout)
        return r.returncode
    print(f"Teaching script not found: {script}")
    return 1

def cmd_patch(args):
    import subprocess
    script = PATCH_HOME / "patch.py"
    if not script.exists():
        print(f"PATCH not found: {script}")
        return 1
    print(f"Boo → PATCH: {' '.join(args)}")
    r = subprocess.run([sys.executable, str(script)] + args, capture_output=True, text=True)
    print(r.stdout)
    if r.stderr: print(f"PATCH errors: {r.stderr}")
    return r.returncode

def cmd_status():
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT COUNT(*) as c FROM trinity")
    total = cur.fetchone()['c']
    cur.execute("SELECT entity_id, entity_value FROM trinity WHERE entity_id LIKE 'BCS_PIPELINE_%%' ORDER BY entity_id")
    pipelines = cur.fetchall()
    conn.close()
    print(f"BOO STATUS — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"Brain: {BRAIN_DB} | {total} rows")
    print(f"PATCH: {'FOUND' if (PATCH_HOME / 'patch.py').exists() else 'MISSING'}")
    print(f"Patricia: {'FOUND' if (PATRICIA_HOME / 'patricia.py').exists() else 'MISSING'}")
    print(f"Teaching doc: {'FOUND' if TEACH_FILE.exists() else 'MISSING'}")
    print(f"\nBCS Pipelines ({len(pipelines)}):")
    for p in pipelines:
        name = p['entity_id'].replace('BCS_PIPELINE_', '')
        try:
            data = json.loads(p['entity_value'])
            print(f"  {name}: {data.get('system','?')} ({len(data.get('tools',[]))} tools) [{data.get('status','?')}]")
        except: print(f"  {name}: {str(p['entity_value'])[:60]}")
    return 0

def main():
    if len(sys.argv) < 2: return cmd_status()
    cmd, args = sys.argv[1], sys.argv[2:]
    if cmd == "think": return cmd_think()
    elif cmd == "speak": return cmd_speak(" ".join(args) if args else "boo was here")
    elif cmd == "listen": return cmd_listen(args[0] if args else 30)
    elif cmd == "teach": return cmd_teach()
    elif cmd == "patch": return cmd_patch(args)
    elif cmd == "status": return cmd_status()
    else: print(f"Unknown: {cmd}"); return 1

if __name__ == "__main__":
    sys.exit(main() or 0)
