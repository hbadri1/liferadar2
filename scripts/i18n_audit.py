import json
import os
import re
from pathlib import Path

ROOT = Path('/Users/houssem/Work/1- Liferadar')
WEB = ROOT / 'src' / 'main' / 'webapp'
I18N = WEB / 'i18n'

jhi_re = re.compile(r"jhiTranslate\s*=\s*['\"]([^'\"]+)['\"]")
pipe_re = re.compile(r"['\"]([^'\"]+)['\"]\s*\|\s*translate")
instant_re = re.compile(r"(?:translateService|this\.translateService|translate)\.(?:instant|get|stream)\(\s*['\"]([^'\"]+)['\"]")

def flatten(obj, prefix=''):
    keys = set()
    if isinstance(obj, dict):
        for k, v in obj.items():
            full = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                keys |= flatten(v, full)
            else:
                keys.add(full)
    return keys

used = set()
for path in WEB.rglob('*'):
    if path.suffix not in ('.ts', '.html'):
        continue
    if path.name.endswith('.spec.ts') or path.name.endswith('.test.ts'):
        continue
    try:
        txt = path.read_text(encoding='utf-8')
    except Exception:
        continue
    used |= set(jhi_re.findall(txt))
    used |= set(pipe_re.findall(txt))
    used |= set(instant_re.findall(txt))

used = sorted(k for k in used if k and '${' not in k and '{{' not in k)

langs = [p.name for p in I18N.iterdir() if p.is_dir()]
lang_map = {}
for lang in langs:
    keys = set()
    for f in (I18N / lang).glob('*.json'):
        try:
            obj = json.loads(f.read_text(encoding='utf-8-sig'))
            keys |= flatten(obj)
        except Exception:
            pass
    lang_map[lang] = keys

print(f'USED_KEYS={len(used)}')
for lang in sorted(langs):
    missing = [k for k in used if k not in lang_map[lang]]
    print(f'[{lang}] missing={len(missing)}')
    for k in missing:
        print(k)
    print('---')

