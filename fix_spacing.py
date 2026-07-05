import os
import glob
import re

replacements = {
    'p-md': 'p-4', 'p-xl': 'p-10', 'mb-md': 'mb-4', 'mb-xl': 'mb-10',
    'space-y-md': 'space-y-4', 'gap-md': 'gap-4', 'p-lg': 'p-6',
    'gap-xs': 'gap-2', 'mb-xs': 'mb-2', 'space-y-lg': 'space-y-6',
    'space-y-xs': 'space-y-2', 'ml-xs': 'ml-2', 'left-md': 'left-4',
    'pr-md': 'pr-4', 'pl-[48px]': 'pl-12', 'pr-[48px]': 'pr-12',
    'right-md': 'right-4', 'py-xs': 'py-2', 'p-sm': 'p-3',
    'mt-md': 'mt-4', 'mt-xl': 'mt-10', 'gap-lg': 'gap-6',
    'gap-sm': 'gap-3', 'mb-sm': 'mb-3', 'mt-sm': 'mt-3',
    'p-xs': 'p-2', 'pt-md': 'pt-4', 'pb-md': 'pb-4',
    'pl-md': 'pl-4', 'ml-md': 'ml-4', 'mr-md': 'mr-4',
    'mt-xs': 'mt-2', 'mr-xs': 'mr-2', 'pl-xs': 'pl-2',
    'pr-xs': 'pr-2', 'py-md': 'py-4', 'px-md': 'px-4',
    'py-sm': 'py-3', 'px-sm': 'px-3', 'py-lg': 'py-6',
    'px-lg': 'px-6', 'w-xs': 'w-2', 'h-xs': 'h-2',
    'w-sm': 'w-3', 'h-sm': 'h-3', 'w-md': 'w-4', 'h-md': 'h-4',
    'w-lg': 'w-6', 'h-lg': 'h-6', 'w-xl': 'w-10', 'h-xl': 'h-10',
    'rounded-DEFAULT': 'rounded-lg', 'w-sidebar-collapsed': 'w-[72px]',
    'w-sidebar-expanded': 'w-[260px]', 'ml-sidebar-collapsed': 'ml-[72px]',
    'ml-sidebar-expanded': 'ml-[260px]', 'p-container-padding': 'p-6',
    'text-label-sm': 'text-[12px]', 'text-label-md': 'text-[14px]',
    'text-body-sm': 'text-[14px]', 'text-body-md': 'text-[16px]',
    'text-body-lg': 'text-[18px]', 'text-headline-md': 'text-[24px]',
    'text-headline-lg': 'text-[32px]', 'text-display-lg': 'text-[48px]'
}

for filepath in glob.glob('app/**/*.tsx', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for k, v in replacements.items():
        pattern = r'(?<=[\s\"\'\`])' + re.escape(k) + r'(?=[\s\"\'\`])'
        content = re.sub(pattern, v, content)
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')
