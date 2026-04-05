import os
import re

def build_index():
    sections_dir = 'sections'
    output_file = 'index.html'
    
    # Get all .html files in the sections directory, sorted by name
    files = sorted([f for f in os.listdir(sections_dir) if f.endswith('.html')])
    
    content = []
    
    print(f"Building {output_file} from {len(files)} sections...")
    
    # Chapter mapping based on filename
    # Only mark actual chapter files, not header/footer
    chapter_map = {
        '02_chapter1_indie_system.html': '01',
        '03_chapter2_vibe_coding.html': '02',
        '04_chapter3_landing_page.html': '03'
    }
    
    for filename in files:
        filepath = os.path.join(sections_dir, filename)
        print(f"  Reading {filepath}...")
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                file_content = f.read()
                
                # Add chapter marker to first slide of each chapter file
                if filename in chapter_map:
                    chapter_num = chapter_map[filename]
                    # Find the first <section class="slide"> and add data-chapter attribute
                    # Match: <section class="slide" ...> or <section class="slide theme-orange" ...>
                    pattern = r'(<section\s+class="slide[^"]*")([^>]*)>'
                    def add_chapter_marker(match):
                        attrs = match.group(2)
                        # Check if data-chapter-start already exists
                        if 'data-chapter-start' not in attrs:
                            return match.group(1) + attrs + f' data-chapter-start="{chapter_num}">'
                        return match.group(0)
                    
                    file_content = re.sub(pattern, add_chapter_marker, file_content, count=1)
                
                content.append(file_content)
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            return

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(content))
        print(f"Successfully built {output_file}!")
    except Exception as e:
        print(f"Error writing {output_file}: {e}")

if __name__ == "__main__":
    build_index()




