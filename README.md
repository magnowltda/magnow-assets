# magnow-assets

Assets estáticos públicos da Magnow (fontes, logo), servidos via [jsDelivr](https://www.jsdelivr.com/)
para uso em páginas customizadas onde não há como hospedar arquivos binários diretamente
(ex.: página "Monte seu Kit" na Yampi — ver `magnowltda/yampi-monte-seu-kit`, `docs/fase5-instalacao.md`).

## Conteúdo
- `eva-pro-900.woff2`, `eva-pro-600.woff2`, `eva-pro-400.woff2` — fonte Eva Pro (pesos 900/600/400)
- `argentum-600.woff2` — fonte Argentum (peso 600)
- `logo-magnow.png` — logo horizontal Magnow

## Uso
```css
@font-face {
  font-family: 'Eva Pro';
  src: url(https://cdn.jsdelivr.net/gh/magnowltda/magnow-assets@main/eva-pro-900.woff2) format('woff2');
  font-weight: 900;
}
```

Sem build, sem processo de deploy — qualquer commit em `main` fica disponível via jsDelivr
(pode levar alguns minutos para o cache do CDN atualizar em arquivos já servidos antes).
