# Все промпты и референсы иллюстраций

Все иллюстрации созданы встроенным image_gen. Ни один кадр игры не использует фотографию напрямую. Точные схемы расположения кадров заданы в data/art-map.json.


---

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


---

# Титул, пролог и общий финал

Иллюстрации созданы встроенным image_gen, без стоковых материалов и фотографий в самой игре. Референс внешности: assets/characters-reference.png, основанный на четырёх предоставленных фотографиях. Все используемые изображения находятся в assets; оптимизированные версии в assets/optimized. Финальный index.html содержит все ресурсы внутри файла.

## Обложка — assets/cover.png

Use case: illustration-story. Create a premium cinematic hand-drawn original family-animation game COVER, wide landscape. Use provided character reference as strict identity/style reference: Tanya is top-left portrait, preserve face proportions, blue-gray eyes, long golden light-brown wavy hair and gentle smile. Not photorealistic. Tanya aged30 stands near CENTER-RIGHT foreground in beautiful ivory dress with delicate golden embroidery, looking warmly toward viewer, flowing hair. A lush enchanting French Alpine garden on her birthday, many beautiful flowers, elegant cream/gold balloons, drifting golden sparks. Far background subtle three magical vistas: Russian fairytale forest and tiny crowned frog, whimsical giant mushrooms, opulent French palace. She is clear largest main subject. Composition: full upper body visible right half, clean softly dark forest foliage in left 43% for HTML title text. Beautiful painterly detailed background, expressive eyes, clean confident animation lines, softly painted shadows, emerald teal leaves, warm golden sunlight, harmonious coral and cream. SINGLE cohesive full scene, no panels, no borders, no UI, no letters, no logos, no watermarks, no copied movie characters. Leave lower 15% gently dark. Request high-resolution landscape 2048x1365 or best available.

## Атлас дома — assets/home-1.png

Use case illustration-story. ONE game environment ILLUSTRATION ATLAS, exact TWO columns TWO rows, 4 equal landscape panels, no gutters/borders/labels. Strictly match attached original animated character design/style: top-left Tanya light golden-brown flowing hair bluegray eyes; top-right Medi dark curly short hair olive skin brown eyes heavy brows stubble; bottom-left Alice little toddler lightbrown hair lilac butterfly clip floral lilac dress; bottom-right friendly Red Queen brown wavy hair jeweled red crown. Delicate confident hand-drawn family-feature-animation outlines, rich painterly backgrounds, expressive clean cartoon faces, warm cinematic sunlight. Not photos. Preserve four identities. Panel TOP LEFT 'bedroom': Tanya wearing cream night blouse in sunlit cozy French Alpine bedroom at08:30, bed bedside table PHONE with notification glows, tea cup, small Alice toy, window overlooks French village and distant Alps; Tanya shown waist-up to right. Panel TOP RIGHT 'home': exterior welcoming French village house at late golden afternoon, door opening warm light inside, flowers gold balloons visible, Tanya approaching in ivory festive dress, recognizable Alps afar. Panel BOTTOM LEFT 'party': inside same French home, warm birthday celebration garlands flowers balloons festive table enormous candle cake and blank cream banner across upper wall, Tanya enters and is welcomed by recognizable Medi Alice Red Queen and warmly drawn guests with gifts; all four main reference faces clearly visible, joyful. Panel BOTTOM RIGHT 'drawing': close cinematic scene in same room little Alice proudly handing Tanya a crayon drawing on white paper: exactly FOUR simple stick people, ONE house, ONE HUGE RED HEART, include Tanya hands and Alice smiling beside paper, paper large central and unambiguous, crayon drawing intentionally childlike but surrounding game art polished. Composition each panel clear facial subjects central upper2/3, lower20% softly detailed for dialogue overlay. No UI/no labels/no watermarks/no words. Full polished artwork high resolution 3072x2048 if available.

Разметка 2×2: спальня / дом / встреча гостей / рисунок.

## Эмоциональный финал — assets/home-2.png

Use case illustration-story. Create ONE polished original animated visual novel ART ATLAS, exactly TWO columns TWO rows equal landscape panels, no gutters lines borders or labels. Match attached character-reference sheet identities and handdrawn animation style strictly: Tanya top-left long lightgolden brown wavy hair bluegray eyes oval face, Medi top-right short dark curly hair olive skin stubble strong eyebrows, Alice bottomleft toddler girl shoulder lightbrown hair purple butterfly clip lilac floral dress, Red Queen bottomright brown waves ruby crown redgold royal dress friendly knowing smile. All recognizably same people, no age shifts, rich detailed warm cinema cartoon, no photo realism. In all panels same French home birthday room, gold garlands flowers creamgold balloons huge candle cake table. Tanya wearing ivory embroidered birthday dress. TOP LEFT 'hug': emotional close shot Tanya kneeling hugging Medi and Alice tightly, family three joined, tender happiness; warm blurred party guests behind. TOP RIGHT 'candles': Tanya leans forward visibly blowing candle flames on enormous ivory cake, lips pursed and a few candles already extinguished with tiny glowing embers, Medi and Alice next to her and Red Queen behind, golden sparks start floating, faces upper two thirds. BOTTOM LEFT 'congratulations': lavish airy cream/gold/teal floral birthday still life, gorgeous huge cake, candles, flowers and gold sparkles, entire four-person family Tanya Medi Alice RedQueen visible as small joyful silhouettes far behind table; broad soft dark emerald center for HTML congratulation overlay (NO actual lettering). BOTTOM RIGHT 'birthday': wide view same beautiful festive room all four main characters smiling with guests and gifts, huge cream banner upper center with exact Cyrillic lettering 'ТАНЕ 30!' only this text, no other words, softly luminous gold glitter. Faces clear, all scenes original. Bottom20% softly detailed for dialogue. Request high resolution3072x2048 or best available.

Разметка 2×2: объятия / свечи / поздравление / праздничная комната с баннером.


---

# Иллюстрации Страны чудес

Все изображения созданы встроенным `image_gen` по закреплённой модели `assets/characters-reference.png`. Авторский стиль: оригинальная семейная рисованная сказочная анимация, мягкий кинематографический свет, детальные лица и окружение. Лицо Тани соответствует верхнему левому портрету, белый брючный костюм и туфли сохраняются до вручения белой короны и накидки. Королева соответствует нижнему правому портрету, Алиса — нижнему левому.

Атласы имеют два столбца и две строки равных иллюстраций без подписей. Координаты CSS: TL 0% 0%, TR 100% 0%, BL 0% 100%, BR 100% 100%; background-size 200% 200%.

## wonderland-1.png

TL rabbit, TR rabbit-hole, BL wonderland, BR hatter.

Prompt: Final production scene atlas, exactly 2 columns and 2 rows, four equally sized landscape panels edge to edge, no gutters, borders, labels or lettering. Same original cinematic family fairy-tale animation and Tanya identity from attached reference. Tanya wears an elegant white tailored jacket and trousers and white heels throughout. Keep important action and faces in central and upper 75% of each panel. TL: bright French bedroom, Alps beyond window, Tanya surprised by white waistcoat rabbit with pocket watch, cup of tea, phone and child's toy. TR: Tanya falling gently through a joyful violet and turquoise magical tunnel with floating clocks. BL: giant mushrooms, flying teapots, expressive talking flowers, winding path in bright Wonderland. BR: original eccentric hat maker at forest tea table with teacups and three clearly distinct hats: playing-card hat, elegant hostess pillbox hat with veil, pink bunny-ear cap. No copied film designs, no photorealism, no watermark.

## wonderland-2.png

TL hats, TR absolem, BL bubbles, BR rose-garden. Внутри TL слева направо: карточная шляпа, шляпка стюардессы с вуалью, розовая шапка с заячьими ушами.

Prompt: Final production 2x2 scene atlas with equal landscape panels, no gutters, borders, labels, text or watermark. Character identity reference plus wonderland-1 setting/style reference. Same white tailored pantsuit and heels for Tanya. Original cinematic family fairy-tale hand-painted animation, detailed environments, harmonious vivid colors, soft light. TL: three large distinct hats on velvet stands: playing-card hat, sophisticated navy airline-hostess pillbox hat with delicate white mesh veil and no broad brim, soft pink cap with long bunny ears. TR: original wise friendly blue-violet caterpillar on a gigantic indigo mushroom in a beautiful woodland gazebo; ornate magical water vessel with hose releases only transparent glowing soap bubbles and violet stars, absolutely no smoke or tobacco. BL: Tanya follows a thousand luminous transparent violet and iridescent soap bubbles toward a spectacular rose-palace among giant mushrooms. BR: White Queen palace garden with white roses, gardeners painting some red with brushes and paint buckets, Tanya arriving, friendly red-gold Queen on distant chaise longue. Important faces/action kept in central upper 75%.

## wonderland-3.png

TL red-queen, TR mug, BL white-crown, BR white-queen. Кружка намеренно имеет чистую белую поверхность для точной надписи средствами HTML.

Prompt: Final production 2x2 atlas with four equal landscape panels and no gutters/borders/labels/lettering. Reference character identities plus wonderland-2 visual style. Tanya preserves golden/light brown waves, blue-gray eyes, oval face and white tailored pantsuit and heels. Red Queen preserves different face, warm brown eyes, darker brown voluminous ombre waves, lively brows, friendly open smile, crimson and gold gown and gemstone crown. Alice preserves toddler age, round face, blue-gray eyes, light brown shoulder-length waves, lilac butterfly clip and floral lilac dress. TL: friendly clever Queen jokes from chaise longue with standing Tanya in rose garden. TR: medium close view of Tanya handing delighted Queen a beautiful large white ceramic mug; clean blank front toward viewer for exact later text overlay. BL: Queen still wearing red-gold crown presents a second delicate white-silver crown and light white cape to Tanya. BR: Tanya now wears received white crown and cape over her pantsuit and holds toddler Alice's hand, radiant white light and rose palace dissolving behind. Same original painted cinematic family fairy-tale style, soft light, detail, harmonious vivid colors. No copied film designs, photorealism, added protagonists or watermark. Faces and action central in upper three quarters.

## wonderland-4.png

Одиночный горизонтальный кадр alice-home, не атлас.

Prompt: Single landscape final scene, not a grid. Tanya and little Alice have magically returned to the familiar sunny French bedroom, rose palace gone. Tanya kneels or sits on bed edge to embrace Alice at toddler height, mutual warm happy relief. Preserve character-reference faces exactly: Tanya adult30 long golden/light brown waves, blue-gray eyes, white pantsuit, white/silver crown, flowing light white cape; Alice tiny toddler with round face, blue-gray eyes, light brown shoulder-length waves, lilac butterfly clip, floral lilac dress and tights. Same lavender textiles, bedside phone, teacup, teddy toy, window to French village and Alps as wonderland-1 top-left. Warm sunlight and fading white magical sparkles. Original richly painted cinematic family fairy-tale animation. Only Tanya and Alice, no typography, lettering, border, watermark or copied film designs.

Точечная правка встроенным инструментом: удалена непреднамеренная нарисованная рамка интерфейса снизу, под ней восстановлены узорчатое покрывало и ковёр; лица, позы, костюмы и комната сохранены.


---

# Дворцовые иллюстрации

Созданы встроенным image_gen, без внешних стоков. Первые три файла — атласы 1536×1024, сетка 2×2 без рамок; каждый кадр 768×512. Последний файл — самостоятельный кадр 1536×1024. Модель Тани, Меди и Алисы взята из assets/characters-reference.png; костюм и окружение закреплены palace-1.png.

## palace-1.png — TL palace; TR throne; BL herald; BR advisor.

```
Use case: illustration-story. Asset type: production artwork atlas for an original fairytale visual novel, four independent fully painted 3:2 landscape scenes arranged in an EXACT 2 columns by 2 rows grid. One atlas canvas, overall landscape 3:2 ratio, very high resolution 3072x2048 if possible. NO borders, NO gutters, NO captions, NO text.
Reference image is the locked character design reference, not a scene to reproduce. Match its exquisite hand-drawn cinematic family-animation rendering: graceful expressive faces, dimensional painterly shading, fine elegant linework, warm rich color, ornate costumes. Tanya is TOP LEFT woman from reference: blue gray eyes, long wavy golden light brown hair, fair skin, recognizable soft oval face. Keep identical face in every scene. Here she wears an ornate French royal rose-pink and rose-gold gown, small diamond crown, diamond earrings, exquisite embroidery.
TOP LEFT PANEL: wide Versailles golden palace hall, huge windows and mirrors, carved gold columns, chandeliers, marble floor, Tanya entering in wonder, dress flowing, sumptuous cinematic perspective.
TOP RIGHT PANEL: Tanya seated regally on an elaborate gilded French throne, warm smile and playful confident gaze, rose gown crown diamonds, beautiful palace background, medium full figure.
BOTTOM LEFT PANEL: original theatrical palace herald with a ceremonial staff and two elegantly dressed footmen opening the grand double doors, Tanya nearby receiving this royal ceremony, humorous friendly expressions.
BOTTOM RIGHT PANEL: original kindly bespectacled royal advisor in elegant eighteenth-century court attire, holding documents and explaining them to Tanya, she listens amused, golden palace office and throne visible.
Each panel MUST have its own complete coherent environment and scene, not just four portraits. All faces and hands anatomically polished. Keep faces/action in upper 75 percent of each panel, bottom 20 percent softly detailed for a dialogue overlay. Original characters, no copied film designs, no photorealism, no modern tech, no text, no watermarks.
```

## palace-2.png — TL breakfast; TR dossier; BL council; BR minister.

```
Use case: illustration-story. Asset type: production artwork atlas for an original fairytale visual novel, four independent fully painted 3:2 landscape scenes arranged in an EXACT 2 columns by 2 rows grid. Overall canvas landscape 3:2 ratio, maximum high resolution 3072x2048 if possible. NO borders, NO gutters, NO captions, NO text.
Input reference 1 is the locked character design; reference 2 is approved Versailles palace art. Precisely match the exquisite hand-drawn cinematic family-animation rendering and Tanya's identical face and exact rose-pink/rose-gold royal gown and diamond crown from reference 2. Tanya: blue gray eyes, long wavy golden light brown hair, fair skin, soft oval face, 30-year-old woman. Same kindly bespectacled silver-haired royal advisor. All supporting people are original warm humorous court characters.
TOP LEFT PANEL: luxurious French state breakfast in a light palace breakfast room, Tanya delighted and amused before a beautiful table of golden croissants, tea porcelain silver service jam fruit, gold baroque decor, warm morning sun.
TOP RIGHT PANEL: Tanya and kindly advisor at ornate palace desk, advisor revealing a comically huge classified dossier and unfurling its large parchment papers, Tanya leans forward intrigued, no legible writing on papers, cinematic close medium scene.
BOTTOM LEFT PANEL: Tanya on her throne thoughtfully presiding over a cheerful royal council, original ministers in colorful eighteenth-century coats holding documents and discussing a matter, expressive theatrical gestures, beautiful palace hall.
BOTTOM RIGHT PANEL: original friendly military minister in a navy blue and gold court uniform presenting a large parchment map of Europe on a table to Tanya, she looks analytical and playfully decisive, map with no labels, ornate palace planning chamber.
Each panel its own complete scene and environment. Faces and actions in upper 75 percent, bottom 20 percent softer detail for dialogue overlay. Original elegant fairytale art, no copied film characters, no photographic rendering, no weapons in action, no text, no watermarks.
```

## palace-3.png — TL rainbow-knights; TR peace-delegation; BL throne-shoes; BR last-decree.

```
Use case: illustration-story. Asset type: production artwork atlas for an original fairytale visual novel, four independent richly painted 3:2 landscape scenes arranged in an EXACT 2 columns by 2 rows grid. Overall canvas landscape 3:2 ratio, maximum high resolution 3072x2048 if possible. NO borders, NO gutters, NO captions, NO text.
Input reference 1 is locked character design; reference 2 approved Versailles palace art. Precisely match fine hand-drawn cinematic family-animation rendering, warm painterly shading, and Tanya's identical soft oval face, blue gray eyes, long flowing golden light brown wavy hair, exact rose-pink/rose-gold royal gown and delicate diamond crown in reference2. Same queen in all four panels, same age30.
TOP LEFT PANEL: Tanya standing proudly at a Versailles garden balcony greeting a parade of friendly elegant knights wearing gleaming rainbow-colored ceremonial armor and flowing rainbow capes. Vibrant cheerful diplomacy, palace flowers in sunlight, no weapons in action, original fairytale knights.
TOP RIGHT PANEL: a cheerful diplomatic delegation in ornate international fairytale court clothes brings Tanya a parchment peace treaty with no legible writing and silver platters of delicious sweets, macarons, petits fours and candies, gorgeous palace reception room. Tanya amused and welcoming, warm peaceful festive mood.
BOTTOM LEFT PANEL: Tanya alone relaxed on her gilded rose-velvet throne, she has removed her high-heeled shoes which are visibly placed neatly beside the throne on the marble floor, her bare feet comfortably resting on a small silk footstool. Natural charming pose and sly happy grin, evening palace light, same rose-gold gown covers legs modestly.
BOTTOM RIGHT PANEL: Tanya at a beautiful carved desk signing her last royal decree with feather quill, warm resolute playful smile, advisor and court applauding delightedly behind her, paper has no writing, golden sparkling palace backdrop, celebratory conclusion.
Each panel its own complete coherent environment. Keep faces/action upper75%, bottom20% softer detail for a dialogue overlay. Original richly detailed artwork, expressive graceful faces, coherent hands and anatomy, no copied movie characters, no photographs, no horror, no violence, no text or watermark.
```

## palace-party.png — one full scene, palace birthday party.

```
Use case: illustration-story. Asset type: one standalone full landscape scene, NOT an atlas and NOT divided panels, 3:2 landscape cinematic illustration at highest possible resolution. A heartfelt surprise birthday party inside a magnificent golden Versailles palace hall. Tanya, the same woman as TOP LEFT in character reference and queen in palace reference, blue-gray eyes, long flowing golden light brown wavy hair, soft oval face, 30-year-old woman, wears the identical ornate rose-pink and rose-gold French royal gown, delicate diamond crown, diamond earrings. She stands near center looking wonderfully surprised and joyful as palace guests appear with flowers and wrapped gifts around an enormous beautiful multi-tier birthday cake with thirty tiny glowing candles. Her dark curly-haired olive-skinned husband Medi (TOP RIGHT reference, strong dark brows, brown eyes, stubble) smiles beside her in an elegant dark blue suit; their little daughter Alice (BOTTOM LEFT reference, same toddler face, shoulder-length light brown hair, blue-gray eyes, lilac butterfly clip, lilac floral party dress) holds a small wrapped gift. Friendly original herald, footmen, bespectacled silver-haired advisor and assorted court guests join celebration. Warm emotional family moment, graceful expressive hand-drawn faces, finely detailed beautiful environment, warm dimensional painterly shading matching reference, sophisticated original family-feature animation. Flowers, ornate chandeliers, gilded mirrors and twinkling gold confetti fill the room. Frame waist-up and full figures in balanced composition, everyone visible, characters' faces in upper70%, lower20% softly detailed cake table / silk tablecloth for dialogue overlay. No writing, no banners, no text, no watermark, no photographic realism, no copied existing movie designs.
```


