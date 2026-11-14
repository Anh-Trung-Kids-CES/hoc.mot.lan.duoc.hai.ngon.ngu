import os, numpy as np
from PIL import Image, ImageFilter
W='/home/claude/work'; S=W+'/sheets'; O=W+'/out'; os.makedirs(O,exist_ok=True)
def cell(path, n, i, m=22):
    im=Image.open(path).convert('RGB'); w,h=im.size; r,c=divmod(i,n)
    return im.crop((int(c*w/n)+m, int(r*h/n)+m, int((c+1)*w/n)-m, int((r+1)*h/n)-m))
def trim(im, pad=14, thr=238):
    a=np.asarray(im).astype(int); ys,xs=np.where(a.min(axis=2)<thr)
    return im.crop((max(xs.min()-pad,0),max(ys.min()-pad,0),min(xs.max()+pad+1,im.width),min(ys.max()+pad+1,im.height)))
def sq(im, size=360):
    s=max(im.size); b=Image.new('RGB',(s,s),'white'); b.paste(im,((s-im.width)//2,(s-im.height)//2)); return b.resize((size,size),Image.LANCZOS)
def whiten(im):
    a=np.asarray(im).astype(float); mx=a.max(axis=2); mn=a.min(axis=2); sat=(mx-mn)/np.maximum(mx,1)
    m=(sat<0.17)&(mn>=205); a[m]=255; return Image.fromarray(a.astype('uint8'))
def save(im,name): sq(trim(im)).save(f'{O}/{name}.webp','WEBP',quality=88)
if __name__=='__main__':
    A=S+'/A_1.png'
    save(cell(A,3,0),'bath'); save(cell(A,3,1),'horse'); save(cell(A,3,2),'what_s_your_name'); save(cell(A,3,7),'down')
    cell(A,3,6).save(W+'/apple_raw.png'); cell(A,3,5).save(W+'/calendar_raw.png')
    save(cell(S+'/D_1.png',2,1,m=40),'come')
    B=S+'/B_1.png'
    for i,n in ((1,'in_front'),(2,'next_to'),(3,'between')): save(whiten(cell(B,2,i)),'prep_'+n)
    C=S+'/C_1.png'
    for i,n in ((0,'they_eat'),(1,'they_run'),(2,'they_swim')): save(cell(C,2,i),'ing_'+n)
    print(sorted(os.listdir(O)))
    names=sorted(os.listdir(O)); sheet=Image.new('RGB',(360*5,360*((len(names)+4)//5)),'white')
    for k,n in enumerate(names): sheet.paste(Image.open(f'{O}/{n}'),((k%5)*360,(k//5)*360))
    sheet.save(W+'/contact1.png')
