from pathlib import Path
import pypdfium2 as pdfium, pdfplumber, json
import sys
from PIL import Image, ImageDraw

root=Path(__file__).parent
if '--actualizado' in sys.argv:
    root=root/'actualizado'
if '--pacientes-originales' in sys.argv:
    root=root/'pacientes_originales'
for name,pdf in [('final_v3' if '--v3' in sys.argv else 'final_v2',root/'Entregable_BD2_Karely.pdf')]:
    doc=pdfium.PdfDocument(str(pdf))
    textdoc=pdfplumber.open(pdf)
    target=root/('qa_'+name)
    target.mkdir(exist_ok=True)
    data=[]
    for i,page in enumerate(doc):
        page.render(scale=1.15).to_pil().save(target/f'page-{i+1:03}.png')
        tp=textdoc.pages[i]
        text=tp.extract_text() or ''
        data.append({'page':i+1,'characters':len(text),'first':text[:100],
                     'outside':[(b['text'],b['x0'],b['x1'],b['bottom']) for b in tp.extract_words() if b['x1']>tp.width+1 or b['bottom']>tp.height+1 or b['x0']< -1]})
    for start in range(0,len(doc),12):
        sheet=Image.new('RGB',(1440,1600),'#D8D8D8')
        draw=ImageDraw.Draw(sheet)
        for n in range(start,min(start+12,len(doc))):
            im=Image.open(target/f'page-{n+1:03}.png');im.thumbnail((350,493))
            x=(n-start)%4*360;y=(n-start)//4*530
            sheet.paste(im,(x+(350-im.width)//2,y+24))
            draw.text((x+8,y+5),f'Pagina {n+1}',fill='black')
        sheet.save(target/f'contact-{start//12+1}.jpg',quality=90)
    (target/'qa.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
    print(name,'pages',len(doc),'outside',sum(bool(x['outside']) for x in data),'short',[x['page'] for x in data if x['characters']<50])
