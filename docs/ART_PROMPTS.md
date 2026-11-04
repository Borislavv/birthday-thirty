# Иллюстрации и модели персонажей

Все изображения созданы встроенным инструментом image_gen. Фотографии использовались как референсы внешности, но не включаются в игру.

## Зафиксированная модель

`assets/characters-reference.png`: четыре равных панели 2×2: Таня, Меди, Алиса, Красная королева. Мультяшная модель сохраняется в остальных изображениях.

Художественные инварианты: оригинальная рисованная семейная анимация; выразительные крупные глаза; гладкая стилизованная кожа; мягкая живописная светотень; детализированные костюмы; никаких фотографических лиц или готовых персонажей известных мультфильмов.

Таня: 30 лет, длинные волнистые золотисто-русые волосы, серо-голубые глаза, мягкое овальное лицо. Меди: смуглая кожа, короткие тёмные кудри, густые брови, карие глаза, лёгкая щетина. Алиса: маленькая девочка с русыми волосами до плеч, серо-голубыми глазами, сиреневой бабочкой в волосах и цветочным платьем. Красная королева: волнистые каштановые волосы, выразительная доброжелательная улыбка, рубиновая корона и багряный костюм.

## Prompt модели

Use case: style-transfer. Repaint the supplied four-person portrait atlas in unmistakable high-budget drawn cartoon family-animation character style, preserving exactly these four identities, panel order, hair, eye colors, costumes, age, and likeness. Bigger expressive eyes, simplified smooth skin with no pores, expressive eyebrows, small stylized noses, elegant clean contour lines, flowing stylized hair locks, soft cel-painted volumes, cinematic 2D animated fairytale design. Four equal quadrants, plain parchment backdrop, no text. Top-left Tanya; top-right Medi; bottom-left toddler Alice; bottom-right friendly Red Queen.

## Наряды

`assets/outfits.png` — три равные вертикальные панели слева направо: сарафан, белый костюм, французское королевское платье. Одинаковые модель, масштаб и стиль.

Prompt: Use case: illustration-story. Costume selection atlas, three exactly equal vertical panels, same full-body Tanya from top-left master model in each, head and feet visible. Left: red Russian sarafan with exquisite golden embroidery, ivory blouse, gold kokoshnik with pearls and red jewels. Center: elegant white tailored pantsuit and heels. Right: magnificent French rose-gold and burgundy brocade royal gown, crown, diamonds. Same exact face, hair, gray-blue eyes, proportions, scale. Magical blush and cream dressing room with gold glints. Rich cinematic hand-drawn family-animation style, smooth cartoon skin, elegant contours, detailed flowing fabric. No text or panel borders.

## Лес 1

`assets/forest-1.png`, 2×2, порядок слева направо по строкам: forest, frog, oak, yaga.

Prompt: Use case: illustration-story. 4-scene cinematic atlas, exact 2x2 grid, no gutters/borders/text. Match character master and left red-gold costume. TL: magical Russian forest, birches, ferns, wooden cottage on chicken legs, Tanya amazed. TR: large green frog Medi on stump with tiny crown, dark curly hair tuft, thick eyebrows and warm brown eyes, playful smile, startled fond Tanya. BL: ancient wise oak with bark face and blank hanging parchment scroll, Tanya considering puzzle. BR: Baba Yaga in carved flying mortar, drinking tea from saucer, skeptical friendly expression, Tanya listening, samovar. Original drawn family-feature animation, expressive eyes, smooth skin, elegant contours, lush painted backgrounds, emerald-crimson-gold, cinematic lighting. Key faces central 70 percent; lower 15 percent clear for dialogue.

## Лес 2

`assets/forest-2.png`, 2×2: tower, frog-pillow, transform, medi.

Prompt: Use case: illustration-story. Exact 2x2 grid, no gutters/margins/frames/text. Use master identities, red sarafan costume and forest-1 continuity. TL: enchanted Koschei tower, thin crowned elderly man peering from window, blank door sign, Tanya holding golden key. TR: hopeful Medi-frog on plush crimson cushion, Tanya leaning close tenderly, sunlit birches and flowers. BL: Tanya kisses frog's head, golden sparkle ring, frog dissolves to golden Medi silhouette, romantic fairytale magic. BR: fully human Medi, dark curls/olive skin/brows/stubble, festive navy-gold suit, tiny crown tilted sideways, Tanya amused beside him. Smooth drawn cartoon faces and proportions, cinematic hand-painted environments, detailed fabrics, no realism/photographic faces, central face composition with lower dialogue space.

## Гости на поляне

`assets/forest-party.png` — одна панорамная сцена.

Prompt: Use case: illustration-story. Wide cinematic illustration, no panels. Preserve master identities, red-gold Tanya outfit and forest-2 human Medi suit/crown. Tanya and human Medi left of center, smiling toward cheerful birthday guests approaching from right with gifts, flowers, huge layered cake and candles. Varied original festive fairytale villagers, no new named characters. Magical forest, silver birches, chicken-legged cottage far behind, flowers and ferns, sunbeams and golden fireflies. Joyful emotional rich emerald/crimson/gold, lush 2D family animation, smooth drawn cartoon faces, no photo realism, no text, lower 20 percent restrained grass for dialogue.

## Исправленный семейный рисунок

`assets/home-1-fixed.png` — исправленная версия home-1. В правом нижнем кадре на детском рисунке теперь два взрослых, маленькая Алиса и будущая малышка-принцесса в розовой пелёнке с крошечной короной. Соответствует реплике Меди в абзаце 329. Большое сердце и дом сохранены. Все остальные сцены, лица и композиция сохранены.

Prompt: Use case: precise-object-edit. Change only the crayon drawing on the sheet of paper in bottom-right quadrant. Exactly four figures: golden-haired adult mother Tanya, curly dark-haired adult father Medi, toddler Alice with lilac bow, and a clearly tiny newborn baby girl half toddler's height in pink swaddling blanket with tiny simple gold crown. Replace rightmost tall adult queen entirely. Keep huge red crayon heart, house, grass and flowers, child's crayon style. Preserve paper and hands, Alice/Tanya faces, hair, clothes and background, exact 2x2 grid. Preserve entire other three quadrants composition and colors unchanged. No text or watermark.

## Задувание свечей

`assets/home-2-candles-out.png` — второе состояние кадра со свечами: в верхней правой панели все свечи погасли, остаются тонкие струйки дыма от фитилей. Используется для плавного перехода при задувании свечей. Остальные три кадра и лица сохранены.

Prompt: Use case: precise-object-edit. Change only candle flames in top-right quadrant of 2x2 birthday-party atlas. Every candle on the cake is fully extinguished after Tanya's breath, no fire or glowing flames, keep unlit candle sticks and dark wick tips, very delicate pale curling wisps. Preserve Tanya's blowing expression and all family faces/hair/costumes/poses, cake and decorations, lighting and alignment exactly. Entire other three panels remain unchanged with original lit candles. Preserve original atlas dimensions and original drawn cartoon animation style, no text or labels. Second aligned frame for candle-blowout crossfade.
