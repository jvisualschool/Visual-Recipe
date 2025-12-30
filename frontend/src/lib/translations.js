export const translations = {
    ko: {
        // Layout
        title: 'Visual Chef',
        galleryBtn: '갤러리',
        generatorBtn: '생성기',

        // Hero
        heroTitle: "나만의 AI 쉐프",
        heroSubtitle: "",
        heroDesc: "요리 이름만 입력하세요. 근사한 레시피를 만들어드립니다.",
        placeholder: "예: 김치찌개, 파스타, 떡볶이...",
        generateBtn: "요리 시작하기",
        generating: "요리하는 중...",

        // Options
        labelDish: "요리 이름",
        labelLang: "생성 언어",
        recentRecipes: "✨ 최근 생성된 레시피",
        optRatio: "화면 비율",
        optStyle: "비주얼 스타일",
        optView: "구조/뷰",
        optRender: "텍스트 모드",
        optionValues: {
            lang: {
                ko: '한국어',
                en: 'English',
                bilingual: '한/영 병기'
            },
            ratio: {
                vertical: '세로형 (9:16)',
                horizontal: '가로형 (16:9)',
                square: '정방형 (1:1)'
            },
            style: {
                minimal: '모던 미니멀',
                infographic: '3D 인포그래픽',
                watercolor: '감성 수채화',
                graphic: '그래픽 레코딩',
                sketch: '연필 스케치',
                girlish: '여중생 색연필',
                botanical: '보태니컬 아트'
            },
            layout: {
                standard: '기본 3단 구성',
                bento: '벤토 그리드',
                radial: '원형 포커스',
                magazine: '매거진 커버'
            },
            render: {
                embedded: { title: '이미지 내장 (AI)', desc: 'AI가 텍스트까지 직접 그립니다.' },
                overlay: { title: 'HTML 오버레이 [개발중]', desc: '깔끔한 고해상도 텍스트 (개발중)' }
            }
        },

        // Gallery
        galleryTitle: "레시피 갤러리",
        galleryDesc: "AI 쉐프가 만든 다채로운 요리들을 감상해보세요.",
        totalRecipes: "총 레시피",
        todayRecipes: "오늘 생성",
        viewFull: "크게 보기",
        ingredients: "재료",
        instructions: "조리 순서",
        downloadImg: "이미지 다운로드",
        delete: "삭제",
        copyList: "복사",
        copied: "완료!",

        // Loading - 50 Fun Food Facts
        loadingMessages: [
            "🍅 토마토는 과일일까 채소일까? 식물학적으로는 과일이에요!",
            "🍯 꿀은 절대 상하지 않아요. 3000년 된 꿀도 먹을 수 있대요!",
            "🥕 당근은 원래 보라색이었어요. 오렌지색은 네덜란드에서 개량된 거예요.",
            "🍫 초콜릿은 한때 화폐로 사용됐어요. 아즈텍 문명에서요!",
            "🧅 양파를 썰 때 우는 이유? 황 화합물이 눈을 자극해서예요.",
            "🍌 바나나는 베리(장과)의 일종이에요. 딸기는 아니고요!",
            "🥜 땅콩은 견과류가 아니에요. 콩과 식물이죠!",
            "🍕 세계에서 가장 비싼 피자는 1200만원이에요. 캐비어 토핑!",
            "🌶️ 매운맛은 사실 '맛'이 아니라 통증 신호예요.",
            "🍎 사과는 장미과에 속해요. 장미의 친척인 셈이죠!",
            "🧀 치즈에는 2000가지 이상의 종류가 있어요.",
            "🍜 라면은 1958년 일본에서 처음 발명됐어요.",
            "🥚 달걀 껍데기 색은 닭의 귓볼 색으로 예측할 수 있어요!",
            "🍣 초밥은 원래 패스트푸드였어요. 에도 시대 길거리 음식!",
            "🥦 브로콜리는 꽃봉오리를 먹는 거예요.",
            "🍿 팝콘은 5000년 전부터 먹었대요. 아메리카 원주민들이!",
            "🧄 마늘은 뱀파이어뿐 아니라 모기도 쫓는대요!",
            "🍋 레몬에는 딸기보다 당분이 더 많아요. 신맛에 가려질 뿐!",
            "🥒 오이는 92%가 수분이에요. 사실상 마시는 음식!",
            "🍦 아이스크림 두통의 정식 명칭은 'Sphenopalatine Ganglioneuralgia'예요.",
            "🌽 옥수수 한 줄에는 항상 짝수 개의 알이 달려요.",
            "🍔 햄버거는 독일 함부르크에서 유래했어요.",
            "🥑 아보카도는 '악어 배'라는 뜻이에요. 껍질 모양 때문에!",
            "🧁 컵케이크는 원래 계량 편의상 '컵'으로 재료를 쟀대요.",
            "🍇 포도를 전자레인지에 돌리면 플라즈마가 생겨요. 위험!",
            "🥞 팬케이크의 역사는 3만년 전으로 거슬러 올라가요.",
            "🍪 초코칩 쿠키는 실수로 발명됐어요. 초콜릿이 안 녹아서!",
            "🌮 타코는 멕시코 은광 광부들이 처음 먹었대요.",
            "🍝 파스타의 종류는 600가지가 넘어요.",
            "🥗 시저 샐러드는 로마 황제와 무관해요. 요리사 이름이에요!",
            "🍤 새우의 심장은 머리에 있어요.",
            "🧇 와플의 격자무늬는 시럽을 담기 위해 만들어졌어요.",
            "🍰 치즈케이크는 고대 그리스 올림픽 선수들 음식이었어요.",
            "🥖 바게트 길이는 프랑스 법으로 정해져 있어요.",
            "🍞 식빵 한 덩이를 만드는 데 밀알 약 1만 개가 필요해요.",
            "🥟 만두는 실크로드를 따라 전 세계로 퍼졌어요.",
            "🍛 카레는 영국을 거쳐 일본에 전해졌어요. 인도 직행이 아녜요!",
            "🧈 버터 1kg을 만들려면 우유 21리터가 필요해요.",
            "🍩 도넛 구멍은 익히기 쉽게 하려고 만들었대요.",
            "🥐 크루아상은 오스트리아에서 시작됐어요. 프랑스가 아니에요!",
            "🍱 일본 도시락 문화는 400년 넘는 역사가 있어요.",
            "🌯 부리토는 '작은 당나귀'라는 뜻이에요.",
            "🥧 파이 던지기는 1900년대 무성영화에서 시작됐어요.",
            "🍨 바닐라는 세계에서 두 번째로 비싼 향신료예요.",
            "🧊 얼음은 뜨거운 물이 더 빨리 얼 수 있어요. 음펨바 효과!",
            "🍶 된장은 발효에 6개월~2년이 걸려요.",
            "🥘 비빔밥의 '비빔'은 '섞다'라는 순우리말이에요.",
            "🍚 한국인 1인당 연간 쌀 소비량은 약 57kg이에요.",
            "🥢 젓가락은 3000년 전 중국에서 요리도구로 시작됐어요.",
            "🍳 계란 프라이 위에 뿌리는 후추는 소화를 돕는대요!"
        ]
    },
    en: {
        // Layout
        title: 'Visual Chef',
        galleryBtn: 'Gallery',
        generatorBtn: 'Generator',

        // Hero
        heroTitle: "Your Personal AI Chef",
        heroSubtitle: "",
        heroDesc: "Just enter the dish name. We'll generate the recipe and a stunning image.",
        placeholder: "e.g., Kimchi Stew, Pasta, Burger...",
        generateBtn: "Start Cooking",
        generating: "Cooking...",

        // Options
        labelDish: "The Dish",
        labelLang: "Language",
        recentRecipes: "✨ Recently Cooked",
        optRatio: "Aspect Ratio",
        optStyle: "Visual Style",
        optView: "Structure/View",
        optRender: "Text Mode",
        optionValues: {
            lang: {
                ko: 'Korean',
                en: 'English',
                bilingual: 'Bilingual'
            },
            ratio: {
                vertical: 'Vertical (9:16)',
                horizontal: 'Horizontal (16:9)',
                square: 'Square (1:1)'
            },
            style: {
                minimal: 'Modern Minimalist',
                infographic: '3D Infographic',
                watercolor: 'Cozy Watercolor',
                graphic: 'Graphic Recording',
                sketch: 'Pencil Sketch',
                girlish: 'Girlish Doodle',
                botanical: 'Botanical Art'
            },
            layout: {
                standard: 'Standard 3-Section',
                bento: 'Bento Grid',
                radial: 'Radial Focus',
                magazine: 'Magazine Hero'
            },
            render: {
                embedded: { title: 'Embedded (AI)', desc: 'Text drawn by AI.' },
                overlay: { title: 'Overlay (CSS) [Dev]', desc: 'Clean HTML text (In Development)' }
            }
        },

        // Gallery
        galleryTitle: "Recipe Gallery",
        galleryDesc: "Explore the visual culinary creations generated by our AI Chef.",
        totalRecipes: "Total Recipes",
        todayRecipes: "Today",
        viewFull: "View Full Image",
        ingredients: "Ingredients",
        instructions: "Instructions",
        downloadImg: "Download Image",
        delete: "Delete",
        copyList: "Copy List",
        copied: "Copied!",

        // Loading - 50 Fun Food Facts
        loadingMessages: [
            "🍅 Tomato: Fruit or vegetable? Botanically, it's a fruit!",
            "🍯 Honey never spoils. 3000-year-old honey is still edible!",
            "🥕 Carrots were originally purple. Orange came from Dutch breeding.",
            "🍫 Chocolate was once used as currency by the Aztecs!",
            "🧅 Onions make you cry because of sulfur compounds.",
            "🍌 Bananas are berries. Strawberries are not!",
            "🥜 Peanuts aren't nuts. They're legumes!",
            "🍕 The most expensive pizza costs $12,000 with caviar topping!",
            "🌶️ Spiciness isn't a taste—it's a pain signal!",
            "🍎 Apples belong to the rose family. They're cousins!",
            "🧀 There are over 2,000 varieties of cheese worldwide.",
            "🍜 Instant ramen was invented in Japan in 1958.",
            "🥚 You can predict eggshell color from a chicken's earlobes!",
            "🍣 Sushi started as fast food in Edo-period Japan!",
            "🥦 Broccoli is actually a flower bud we eat.",
            "🍿 Popcorn has been eaten for over 5,000 years!",
            "🧄 Garlic repels not just vampires, but mosquitoes too!",
            "🍋 Lemons have more sugar than strawberries. The sour hides it!",
            "🥒 Cucumbers are 92% water. Basically drinkable food!",
            "🍦 Brain freeze is called 'Sphenopalatine Ganglioneuralgia'.",
            "🌽 Corn always has an even number of rows.",
            "🍔 Hamburgers originated in Hamburg, Germany.",
            "🥑 Avocado means 'alligator pear' due to its skin texture!",
            "🧁 Cupcakes were named because ingredients were measured in cups.",
            "🍇 Microwaving grapes creates plasma. Don't try it!",
            "🥞 Pancakes date back 30,000 years!",
            "🍪 Chocolate chip cookies were invented by accident!",
            "🌮 Tacos were first eaten by Mexican silver miners.",
            "🍝 There are over 600 types of pasta.",
            "🥗 Caesar salad is named after a chef, not the Roman emperor!",
            "🍤 A shrimp's heart is located in its head.",
            "🧇 Waffle grids were designed to hold syrup.",
            "🍰 Cheesecake was eaten by ancient Greek Olympians.",
            "🥖 Baguette length is regulated by French law.",
            "🍞 One loaf of bread needs about 10,000 wheat grains.",
            "🥟 Dumplings spread worldwide via the Silk Road.",
            "🍛 Curry reached Japan through Britain, not directly from India!",
            "🧈 It takes 21 liters of milk to make 1kg of butter.",
            "🍩 Donut holes were made for even cooking.",
            "🥐 Croissants originated in Austria, not France!",
            "🍱 Japanese bento culture is over 400 years old.",
            "🌯 Burrito means 'little donkey' in Spanish.",
            "🥧 Pie throwing started in 1900s silent films.",
            "🍨 Vanilla is the world's second most expensive spice.",
            "🧊 Hot water can freeze faster than cold. Mpemba effect!",
            "🍶 Doenjang (Korean miso) takes 6 months to 2 years to ferment.",
            "🥘 Bibimbap's 'bibim' means 'to mix' in pure Korean.",
            "🍚 Koreans consume about 57kg of rice per person annually.",
            "🥢 Chopsticks started as cooking tools 3,000 years ago in China.",
            "🍳 Black pepper on fried eggs actually aids digestion!"
        ]
    }
};
