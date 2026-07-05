import os
import glob
import re

size_map = {
    'xs': '2',
    'sm': '3',
    'md': '4',
    'lg': '6',
    'xl': '10'
}

# Prefixes that use spacing scale
prefixes = [
    'p', 'px', 'py', 'pt', 'pb', 'pl', 'pr',
    'm', 'mx', 'my', 'mt', 'mb', 'ml', 'mr',
    'gap', 'space-x', 'space-y', 'w', 'h',
    'top', 'bottom', 'left', 'right'
]

replacements = {
    'w-sidebar-collapsed': 'w-[72px]',
    'w-sidebar-expanded': 'w-[260px]',
    'ml-sidebar-collapsed': 'ml-[72px]',
    'ml-sidebar-expanded': 'ml-[260px]',
    'pl-sidebar-collapsed': 'pl-[72px]',
    'pl-sidebar-expanded': 'pl-[260px]',
    'max-w-container-max': 'max-w-[1440px]',
    'p-container-padding': 'p-6',
    'text-label-sm': 'text-[12px]',
    'text-label-md': 'text-[14px]',
    'text-body-sm': 'text-[14px]',
    'text-body-md': 'text-[16px]',
    'text-body-lg': 'text-[18px]',
    'text-headline-md': 'text-[24px]',
    'text-headline-lg': 'text-[32px]',
    'text-display-lg': 'text-[48px]'
}

# Build regex pattern for dynamic spacing classes
pattern_str = r'\b(' + '|'.join(prefixes) + r')-(xs|sm|md|lg|xl)\b'
regex = re.compile(pattern_str)

def replace_match(match):
    prefix = match.group(1)
    size = match.group(2)
    return f"{prefix}-{size_map[size]}"

all_files = glob.glob('app/**/*.tsx', recursive=True) + glob.glob('components/**/*.tsx', recursive=True)

for filepath in all_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Static replacements
    for k, v in replacements.items():
        pattern = r'(?<=[\s\"\'\`])' + re.escape(k) + r'(?=[\s\"\'\`])'
        content = re.sub(pattern, v, content)
        
    # Dynamic spacing replacements
    content = regex.sub(replace_match, content)
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')
