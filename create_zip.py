import os
import zipfile

output_zip = 'public/exchange-ucv-proyecto-completo.zip'

include_files = [
    'index.html',
    'vite.config.ts',
    'tsconfig.json',
    'package.json',
    'server.ts',
    'README.md',
    'iniciar_en_windows.bat',
    'iniciar_en_mac_linux.sh',
    '.env.example',
]

include_dirs = [
    'src',
    'public/assets',
]

exclude_extensions = {'.pyc', '.DS_Store', '.zip'}

with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for f in include_files:
        if os.path.isfile(f):
            zipf.write(f, arcname=f)
            print(f"Added file: {f}")

    for d in include_dirs:
        for root, dirs, files in os.walk(d):
            for file in files:
                ext = os.path.splitext(file)[1]
                if ext in exclude_extensions:
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, '.')
                zipf.write(full_path, arcname=rel_path)
                print(f"Added dir file: {rel_path}")

print(f"\nSUCCESS: Generated {output_zip} ({os.path.getsize(output_zip)} bytes)")
