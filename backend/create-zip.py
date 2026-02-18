import zipfile
import os

zip_path = 'deploy-v68.zip'
source_dir = 'deploy-v68'

# Files that should have Unix line endings (LF)
text_extensions = {'.js', '.json', '.ts', '.md', '.txt', ''}

def should_convert_line_endings(filename):
    _, ext = os.path.splitext(filename)
    return ext.lower() in text_extensions or filename in ['Procfile', '.env']

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(source_dir):
        # Skip node_modules if present
        dirs[:] = [d for d in dirs if d != 'node_modules']

        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, source_dir)
            # Use forward slashes for Linux compatibility
            arcname = arcname.replace(os.sep, '/')

            # For text files, ensure Unix line endings
            if should_convert_line_endings(file):
                try:
                    with open(file_path, 'rb') as f:
                        content = f.read()
                    # Convert CRLF to LF
                    content = content.replace(b'\r\n', b'\n')
                    zipf.writestr(arcname, content)
                except:
                    zipf.write(file_path, arcname)
            else:
                zipf.write(file_path, arcname)

print('Created', zip_path)
