#!/usr/bin/env python3
"""
Script para substituir botões azul ciano por azul mais escuro
"""
import os
import re
from pathlib import Path

def fix_cyan_buttons(file_path):
    """Substitui botões azul ciano por azul mais escuro"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Substituições
        content = re.sub(
            r'from-accent-electric to-accent-cyan',
            'from-blue-600 to-blue-700',
            content
        )
        content = re.sub(
            r'shadow-accent-electric/50 hover:shadow-xl hover:shadow-accent-electric/70',
            'shadow-blue-600/50 hover:shadow-xl hover:shadow-blue-600/70',
            content
        )
        content = re.sub(
            r'border-2 border-accent-electric/30"',
            'border-2 border-blue-500/50 hover:from-blue-500 hover:to-blue-600"',
            content
        )
        
        if content != original:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Erro ao processar {file_path}: {e}")
        return False

def main():
    app_dir = Path('app')
    updated = 0
    
    for tsx_file in app_dir.rglob('*.tsx'):
        if fix_cyan_buttons(tsx_file):
            print(f"✓ Atualizado: {tsx_file}")
            updated += 1
    
    print(f"\n✓ {updated} arquivos atualizados!")

if __name__ == '__main__':
    main()





