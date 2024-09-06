#!/usr/bin/env python

import sys
import json
import subprocess
import threading
import struct
from utils import print_json
from python.helpers.print_style import PrintStyle

def send_message(message):
    sys.stdout.buffer.write(struct.pack('I', len(message)))
    sys.stdout.buffer.write(message.encode('utf-8'))
    sys.stdout.buffer.flush()

def read_message():
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length:
        return None
    message_length = struct.unpack('I', raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)

def stream_output(process):
    for line in process.stdout:
        line = line.strip()
        print(f"DEBUG: Received line: {line}")
        send_message(json.dumps({'output': line}))
        # Check if the line starts with "Agent:" and does not appear to be code or JSON
        #if line.startswith("Agent:"): 
            

# and not (line.contains("=") or line.startswith("Code:") or line.startswith("Error:") or line.startswith("{") or line.startswith("[") or line.endswith(")") or line.endswith("}") or line.startswith("```") or line.endswith("```")):

def process_command(command):
    global agent0
    if not agent0:
        print("Agent not initialized. Please start the agent first.")
        return

    print(f"User: {command}")
    assistant_response = agent0.message_loop(command)
    # Use PrintStyle to format the output
    formatted_response = PrintStyle(font_color="white").format(f"{assistant_response}")
    print_json({'output': formatted_response})

def main():
    process = None
    output_thread = None
    while True:
        message = read_message()
        if message is None:
            break
        
        if message.get('command') == 'start':
            if process is None:
                process = subprocess.Popen(['python', 'main.py'], 
                                            stdin=subprocess.PIPE,
                                            stdout=subprocess.PIPE, 
                                            stderr=subprocess.STDOUT, 
                                            universal_newlines=True)
                output_thread = threading.Thread(target=stream_output, args=(process,))
                output_thread.start()
                
                # Start the agent
                process.stdin.write('start\n')
                process.stdin.flush()
                send_message(json.dumps({'output': 'Python script started'}))
            else:
                send_message(json.dumps({'output': 'Python script is already running'}))
        else:
            if process is not None:
                process.stdin.write(message['command'] + '\n')
                process.stdin.flush()
            else:
                send_message(json.dumps({'output': 'Python script is not running. Please start it first.'}))

if __name__ == '__main__':
    main()








# import sys
# import json
# import subprocess
# import threading
# import struct
# from utils import print_json

# def send_message(message):
#     sys.stdout.buffer.write(struct.pack('I', len(message)))
#     sys.stdout.buffer.write(message.encode('utf-8'))
#     sys.stdout.buffer.flush()

# def read_message():
#     raw_length = sys.stdin.buffer.read(4)
#     if not raw_length:
#         return None
#     message_length = struct.unpack('I', raw_length)[0]
#     message = sys.stdin.buffer.read(message_length).decode('utf-8')
#     return json.loads(message)

# def stream_output(process):
#     buffer = ""
#     in_json = False
#     for line in process.stdout:
#         buffer += line
#         if "JSON_START" in buffer:
#             in_json = True
#             buffer = buffer.split("JSON_START", 1)[1]
#         elif "JSON_END" in buffer and in_json:
#             in_json = False
#             json_str = buffer.split("JSON_END", 1)[0]
#             try:
#                 json_obj = json.loads(json_str)
#                 send_message(json.dumps(json_obj))
#             except json.JSONDecodeError:
#                 send_message(json.dumps({'output': json_str}))
#             buffer = buffer.split("JSON_END", 1)[1]
#         elif not in_json:
#             # Instead of sending each line, accumulate the buffer and send it as a whole
#             if buffer.strip():
#                 send_message(json.dumps({'output': buffer.strip()}))
#             buffer = ""

# def process_command(command):
#     global 
#     if not agent0:
#         print("Agent not initialized. Please start the agent first.")
#         return

#     print(f"User: {command}")
#     assistant_response = agent0.message_loop(command)
#     print_json({'output': assistant_response})


# def main():
#     process = None
#     output_thread = None
#     while True:
#         message = read_message()
#         if message is None:
#             break
        
#         if message.get('command') == 'start':
#             if process is None:
#                 process = subprocess.Popen(['python', 'main.py'], 
#                                            stdin=subprocess.PIPE,
#                                            stdout=subprocess.PIPE, 
#                                            stderr=subprocess.STDOUT, 
#                                            universal_newlines=True)
#                 output_thread = threading.Thread(target=stream_output, args=(process,))
#                 output_thread.start()
                
#                 # Start the agent
#                 process.stdin.write('start\n')
#                 process.stdin.flush()
#                 send_message(json.dumps({'output': 'Python script started'}))
#             else:
#                 send_message(json.dumps({'output': 'Python script is already running'}))
#         else:
#             if process is not None:
#                 process.stdin.write(message['command'] + '\n')
#                 process.stdin.flush()
#             else:
#                 send_message(json.dumps({'output': 'Python script is not running. Please start it first.'}))

# if __name__ == '__main__':
#     main()
