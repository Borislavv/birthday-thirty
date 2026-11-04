"""Import wording revision into stable paragraph slots without renumbering.

The original DOCX extraction remains historical. New branch-only source lines
occupy appended slots 350..353 and are read before the original paragraph 98.
"""
import copy
import difflib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / 'source/document.json'
RAW = ROOT / 'source/scenario-revised.txt'
TARGET = ROOT / 'source/revised-document.json'

REPLACEMENTS = {
    2: 'Утро именинницы',
    11: 'Сообщение:',
    14: 'Русская девица-красавица',
    19: 'Белый костюм ',
    23: 'Королева Франции',
    27: '«Операция Расколдуй мужа»',
    29: 'Где мой принц?',
    39: 'На экране появляется сообщение:',
    45: 'Первая загадка. Лесная мудрость',
    61: 'Сообщение:',
    65: 'Вторая загадка. Бабушкина избушка',
    84: 'Третья загадка. Испытание Кощея',
    85: 'Таня подходит к высокой башне. Из окна выглядывает худой старичок с короной.',
    98: 'Поцелуй лягушки',
    111: 'Сообщение:',
    116: '«Алиса в стране чудес и очень странных решений»',
    118: 'Белый кролик не по расписанию',
    127: '— Так. У меня сегодня день рождения, я жду ребенка, и теперь мне нужно спасать дочку в другом измерении?!',
    133: 'Первый шаг. Шляпка для королевы',
    146: 'Очень мило. Но понравится ли королеве? .',
    155: 'Второй шаг. Волшебный кальян Абсолема',
    187: 'Третий шаг. Красные розы и большая дипломатия',
    201: 'Таня достает красивую кружку.',
    204: 'Сообщение:',
    207: 'Превращение в Белую королеву',
    222: '«Тридцать лет абсолютной власти»',
    224: 'Королевский прием',
    233: '',
    234: 'Указ первый. Государственный завтрак',
    249: 'Сообщение:',
    250: 'УКАЗ ПЕРВЫЙ ПОДПИСАН.',
    252: 'Указ второй. Дело государственной важности',
    266: 'Сообщение:',
    267: 'УКАЗ ВТОРОЙ ПРИНЯТ.',
    270: 'Указ третий. Международная политика',
    293: 'Сообщение:',
    294: 'УКАЗ ТРЕТИЙ ПОДПИСАН.',
    296: 'Последний королевский указ',
    306: 'Сообщение:',
    311: '«Тридцать — это только начало»',
    313: 'Дома',
    315: 'Затем открывается дверь знакомого дома во Франции. В комнате горят гирлянды, на столе стоят угощения, повсюду цветы и воздушные шары. ',
}
INSERTED = [
    'Если выбран неверный ответ:',
    'НЕ ВЕРНО!',
    'Но не переживай: твой муж уже прижился в болоте и на него теперь заглядываются бабы-жабы. Торопись!',
    'Кнопка: «Пересмотреть ответ»',
]


def reading_order():
    return list(range(98)) + [350, 351, 352, 353] + [i for i in range(98, 350) if i != 233]


def nonblank_lines(text):
    # U+2028 is an authored line separator from the pasted text, not prose.
    return [line for line in text.replace('\u2028', '\n').split('\n') if line.strip()]


def apply():
    paragraphs = copy.deepcopy(json.loads(ORIGINAL.read_text()))
    assert len(paragraphs) == 350
    for i, text in REPLACEMENTS.items():
        old_runs = paragraphs[i]['runs']
        # Existing director roles survive conversion to a plain-text source.
        # Mixed director/inscription paragraphs 201,315 now have no inscription.
        italic = bool(old_runs) and (all(r['italic'] for r in old_runs) or i in {201, 315})
        bold = bool(old_runs) and all(r['bold'] for r in old_runs)
        paragraphs[i]['text'] = text
        paragraphs[i]['runs'] = [{'text': text, 'italic': italic, 'bold': bold}] if text else []
    for i, text in enumerate(INSERTED, 350):
        paragraphs.append({'id': i, 'text': text, 'runs': [{'text': text, 'italic': i == 350, 'bold': False}]})
    actual = nonblank_lines('\n'.join(paragraphs[i]['text'] for i in reading_order()))
    expected = nonblank_lines(RAW.read_text())
    assert actual == expected, '\n'.join(difflib.unified_diff(expected, actual, fromfile='new-raw-source', tofile='normalized-reading-order'))
    TARGET.write_text(json.dumps(paragraphs, ensure_ascii=False, indent=2) + '\n')
    print(f'Imported {len(paragraphs)} stable slots; {len(expected)} nonblank source lines match verbatim.')


if __name__ == '__main__':
    apply()
