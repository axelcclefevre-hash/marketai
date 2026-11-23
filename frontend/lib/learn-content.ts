export type Section = {
  id: string;
  title: string;
  content: string;
  formula?: string;
  chart?: string;
  tip?: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type Module = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  duration: string;
  icon: string;
  color: string;
  sections: Section[];
  keyTakeaways: string[];
  quiz: QuizQuestion[];
};

export const MODULES: Module[] = [
  {
    id: "bases",
    number: 1,
    title: "Les bases de l'investissement",
    subtitle: "Comprendre les marchés et les instruments financiers",
    description: "Découvrez pourquoi investir est essentiel, comment mesurer rendement et risque, et quels instruments financiers sont à votre disposition.",
    level: "Débutant",
    duration: "20 min",
    icon: "House",
    color: "#4cc38a",
    sections: [
      {
        id: "pourquoi",
        title: "Pourquoi investir ?",
        content: `Investir n'est pas réservé aux riches ou aux experts. C'est une nécessité pour préserver et faire fructifier son patrimoine.

**Le coût de l'inaction.** Une étude célèbre révèle que 78% des joueurs NFL et 60% des joueurs NBA se retrouvent en difficulté financière dans les 5 ans suivant leur retraite, malgré des revenus colossaux. La raison : l'argent non investi perd de la valeur à cause de l'inflation.

**L'inflation, ennemi silencieux.** Avec une inflation de 2% par an, 10 000€ aujourd'hui n'auront que le pouvoir d'achat de 8 203€ dans 10 ans. Garder son argent sous le matelas, c'est s'appauvrir progressivement.

**L'investissement : une définition simple.** Investir, c'est engager des ressources aujourd'hui en anticipant des bénéfices futurs. Trois éléments essentiels :
— **Le capital** : la somme engagée
— **Le rendement** : le gain attendu (sous forme d'intérêts, dividendes ou plus-values)
— **Le risque** : l'incertitude sur ce rendement`,
        tip: "Règle des 72 : divisez 72 par le taux de rendement annuel pour obtenir le nombre d'années nécessaires pour doubler votre capital. À 6% par an → 12 ans.",
      },
      {
        id: "actifs",
        title: "Actifs réels vs actifs financiers",
        content: `Il existe deux grandes familles d'investissements.

**Les actifs réels** sont des biens tangibles : immobilier, or, matières premières, œuvres d'art. Ils ont une valeur intrinsèque et constituent directement la richesse d'une économie. Avantage : protection contre l'inflation. Inconvénient : illiquidité, coûts de transaction élevés.

**Les actifs financiers** sont des créances sur des actifs réels : actions (parts d'entreprises), obligations (prêts à des émetteurs), produits dérivés. Ils permettent aux investisseurs de participer à la croissance des entreprises sans détenir physiquement leurs usines ou machines.

**Investissement direct vs indirect.** L'investissement direct consiste à acheter soi-même des titres. L'investissement indirect passe par des véhicules collectifs :
— **Fonds communs de placement (OPCVM)** : portefeuille géré par des professionnels
— **ETF (Exchange Traded Funds)** : fonds indiciels cotés en bourse, peu coûteux
— **REIT** : fonds d'investissement immobilier
— **Hedge Funds** : fonds alternatifs pour investisseurs sophistiqués`,
        chart: "RiskReturnScatter",
      },
      {
        id: "rendement",
        title: "Mesurer le rendement",
        content: `Le rendement d'un investissement se calcule de plusieurs façons selon l'horizon considéré.

**Rendement sur une période.** Pour une action achetée à 100€ et revendue à 110€ avec un dividende de 2€ :

**Rendement arithmétique vs géométrique.** Sur plusieurs années, ces deux mesures divergent. Supposons des rendements annuels de +50%, -50%, +50%, -50% :
— Rendement arithmétique moyen = 0% (semble neutre)
— Rendement géométrique = [(1,5 × 0,5 × 1,5 × 0,5)^(1/4)] - 1 = -18,4% par an

La différence est cruciale : le rendement géométrique reflète la réalité de ce que l'investisseur obtient réellement. Avec une volatilité élevée, le rendement géométrique est toujours inférieur au rendement arithmétique — c'est ce qu'on appelle le **drag de la volatilité**.`,
        formula: "R = (Prix_final - Prix_initial + Dividendes) / Prix_initial\nRendement géométrique = [(1+R₁) × (1+R₂) × ... × (1+Rₙ)]^(1/n) - 1",
      },
      {
        id: "risque",
        title: "Mesurer le risque",
        content: `Le risque en finance se mesure par la **variabilité des rendements**. Un actif dont le prix oscille beaucoup est plus risqué qu'un actif stable.

**La variance et l'écart-type.** La variance mesure la dispersion des rendements autour de leur moyenne. L'écart-type (racine carrée de la variance) s'exprime dans la même unité que le rendement, ce qui le rend plus intuitif.

**Exemple concret.** Deux actions avec le même rendement moyen de 10% :
— Action A : rendements de 8%, 10%, 12% → écart-type ≈ 1,6%
— Action B : rendements de -20%, 10%, 40% → écart-type ≈ 24,5%

L'investisseur rationnel préfère A à B à rendement égal : il préfère moins de risque.

**La paradoxe de Saint-Pétersbourg.** Un jeu où on lance une pièce jusqu'à obtenir face : le gain est 2^n où n est le nombre de lancers. L'espérance mathématique est infinie, mais personne ne paierait beaucoup pour jouer. Pourquoi ? Parce que l'utilité marginale de l'argent décroît — c'est le fondement de l'**aversion au risque**.

**Rendement attendu vs rendement réalisé.** L'investisseur doit toujours distinguer ce qu'il espère obtenir (rendement attendu, basé sur des probabilités) et ce qu'il obtiendra réellement (rendement réalisé, incertain par nature).`,
        formula: "σ² = Σ p(s) × [R(s) - E(R)]²\nσ = √σ²\nE(R) = Σ p(s) × R(s)",
        tip: "La règle des 68-95-99 : pour une distribution normale, 68% des rendements tombent à ±1 écart-type, 95% à ±2, 99,7% à ±3.",
      },
      {
        id: "marches",
        title: "Les marchés financiers",
        content: `Les marchés financiers remplissent 3 fonctions essentielles :

**1. La transmission d'information.** Les prix agrègent les anticipations de millions d'acteurs. Une hausse du cours d'Apple signale que le marché anticipe une amélioration des perspectives de l'entreprise.

**2. La consommation inter-temporelle.** Les marchés permettent de déplacer le pouvoir d'achat dans le temps : épargner aujourd'hui pour consommer demain, ou emprunter pour consommer maintenant.

**3. L'allocation du risque.** Les marchés permettent à ceux qui veulent prendre du risque (investisseurs) de le faire, et à ceux qui veulent l'éviter de le transférer.

**Types de marchés.** Du moins au plus organisé :
— Marché de gré à gré (OTC) : deux parties négocient directement
— Marché courtisé : un courtier met en relation acheteurs et vendeurs
— Marché de dealers : un teneur de marché affiche prix d'achat et de vente en continu
— Marché d'enchères : les ordres sont regroupés et exécutés au meilleur prix

**Les ordres boursiers.** L'ordre au marché (market order) est exécuté immédiatement au meilleur prix disponible. L'ordre à cours limité (limit order) ne s'exécute que si le prix atteint le niveau souhaité — protection contre les mouvements défavorables.

**Le coût d'une transaction** comprend la commission du courtier, et surtout le **bid-ask spread** (écart entre le prix auquel le teneur de marché achète et celui auquel il vend). Sur un titre liquide comme l'Apple, ce spread est minuscule. Sur un titre illiquide, il peut représenter plusieurs pourcents.`,
      },
      {
        id: "marge",
        title: "Marge et vente à découvert",
        content: `**Le trading sur marge** permet d'emprunter des fonds à son courtier pour amplifier ses positions. Si vous achetez une action à 100€ avec 50% de marge initiale, vous n'apportez que 50€ et empruntez les 50€ restants.

Si l'action monte à 130€, votre gain est de 30€ sur une mise de 50€, soit 60% de rendement (vs 30% sans marge). Mais si elle tombe à 70€, votre perte est de 30€ sur 50€, soit -60%.

**L'appel de marge.** Si la valeur de votre position chute sous un seuil (la marge de maintenance, souvent 25-30%), votre courtier exige que vous reconstituiez votre marge. Si vous ne pouvez pas, il liquide votre position, potentiellement à un moment défavorable.

**La vente à découvert (short selling).** Vous empruntez des actions pour les vendre, en espérant les racheter moins cher plus tard. Exemple : emprunt et vente de 100 actions Apple à 150€. Si le cours tombe à 120€, vous rachetez à 120€ et réalisez 30€ de gain par action. Mais si le cours monte à 180€, vous perdez 30€ par action — et les pertes sont théoriquement illimitées.`,
        tip: "La vente à découvert est une stratégie risquée réservée aux investisseurs expérimentés. Le risque de perte est théoriquement infini car le prix d'un actif peut monter indéfiniment.",
      },
    ],
    keyTakeaways: [
      "Investir est indispensable pour préserver son pouvoir d'achat contre l'inflation",
      "Le rendement géométrique reflète mieux la réalité que le rendement arithmétique",
      "Le risque se mesure par l'écart-type des rendements",
      "Les marchés financiers transmettent de l'information, allouent du risque et permettent des échanges inter-temporels",
      "La marge amplifie les gains comme les pertes — à manier avec précaution",
    ],
    quiz: [
      {
        question: "Avec une inflation de 2% par an, la valeur réelle de 10 000 € dans 10 ans est approximativement :",
        options: ["8 200 €", "9 800 €", "10 200 €", "12 000 €"],
        correct: 0,
        explanation: "Avec 2% d'inflation par an, le pouvoir d'achat se réduit de (1 - 0,98^10) ≈ 18%. 10 000 € × 0,82 ≈ 8 200 €.",
      },
      {
        question: "Laquelle de ces mesures reflète le mieux la performance réelle d'un portefeuille sur plusieurs années ?",
        options: ["Rendement arithmétique", "Rendement géométrique", "Rendement nominal", "Rendement attendu"],
        correct: 1,
        explanation: "Le rendement géométrique tient compte de l'effet cumulatif et de la volatilité (drag de la volatilité). Il est toujours inférieur ou égal au rendement arithmétique.",
      },
      {
        question: "Qu'est-ce que le bid-ask spread ?",
        options: [
          "L'écart entre le prix d'achat et de vente proposé par le teneur de marché",
          "L'écart entre le RSI haut et bas d'un titre",
          "La différence de rendement entre actions et obligations",
          "Le coût annualisé de l'inflation",
        ],
        correct: 0,
        explanation: "Le bid-ask spread est l'écart entre le prix auquel le teneur de marché achète (bid) et celui auquel il vend (ask). C'est un coût implicite de transaction.",
      },
      {
        question: "L'aversion au risque en finance comportementale signifie :",
        options: [
          "Ne jamais investir en actions",
          "Préférer un résultat certain à un résultat incertain d'espérance identique",
          "Éviter toute perte en capital quoi qu'il arrive",
          "Investir uniquement dans l'or et les obligations",
        ],
        correct: 1,
        explanation: "Un investisseur averse au risque préfère un gain certain de 100 € à un pari offrant 50% de chance de gagner 200 € (même espérance). C'est le fondement de la théorie de l'utilité.",
      },
    ],
  },
  {
    id: "portefeuille",
    number: 2,
    title: "Construire un portefeuille optimal",
    subtitle: "La théorie de Markowitz et la frontière efficiente",
    description: "Apprenez à combiner des actifs pour maximiser le rendement à risque donné, grâce à la théorie moderne du portefeuille.",
    level: "Intermédiaire",
    duration: "25 min",
    icon: "ChartPieSlice",
    color: "#3b82f6",
    sections: [
      {
        id: "tolerancerisque",
        title: "Évaluer sa tolérance au risque",
        content: `Avant de construire un portefeuille, il faut comprendre sa propre psychologie face au risque. La finance moderne pose 5 hypothèses sur les préférences des investisseurs rationnels :

1. **Plus de richesse est préférable à moins** (non-satiation)
2. **Moins de risque est préférable à plus** (aversion au risque)
3. **L'aversion au risque diminue avec la richesse** (vous supportez mieux le risque absolu si vous êtes plus riche)
4. **La douleur d'une perte excède le plaisir d'un gain équivalent** (aversion aux pertes, Kahneman & Tversky)
5. **Un résultat certain est préféré à un résultat incertain d'espérance équivalente**

**Les courbes d'indifférence** représentent graphiquement ces préférences. Chaque courbe relie des combinaisons risque/rendement qui procurent la même utilité à l'investisseur. Un investisseur averse au risque a des courbes d'indifférence très pentues : il demande un rendement supplémentaire élevé pour accepter un peu plus de risque.

**Le coefficient d'aversion au risque A.** En pratique, l'utilité d'un portefeuille peut s'écrire : U = E(R) - ½ × A × σ². Un investisseur avec A élevé (4-6) est très prudent ; un investisseur avec A faible (1-2) est plus spéculatif.`,
        tip: "Testez votre propre aversion au risque : si les marchés chutent de 30% demain, votre réaction instinctive est-elle de vendre tout (A élevé), d'attendre (A moyen), ou d'acheter davantage (A faible) ?",
      },
      {
        id: "markowitz",
        title: "La révolution Markowitz (1952)",
        content: `Harry Markowitz a publié en 1952 un article révolutionnaire qui lui vaudra le Prix Nobel d'économie en 1990. Son insight fondamental : **ce qui compte n'est pas le risque d'un actif individuel, mais sa contribution au risque du portefeuille entier.**

**Le rendement d'un portefeuille** est la moyenne pondérée des rendements de ses composants. Pour deux actifs A et B avec des poids wA et wB (wA + wB = 1) :

**La variance d'un portefeuille** est plus complexe car elle inclut la covariance entre les actifs. C'est là que réside la magie de la diversification : si deux actifs ne sont pas parfaitement corrélés, le risque combiné est inférieur à la moyenne pondérée des risques individuels.

**L'effet de la corrélation.** La corrélation ρ varie entre -1 et +1 :
— ρ = +1 : actifs parfaitement corrélés, pas de bénéfice de diversification
— ρ = 0 : actifs indépendants, diversification partielle
— ρ = -1 : actifs parfaitement anti-corrélés, risque peut être éliminé totalement

**Exemple concret.** Deux actions (Action A : rendement 10%, σ = 20%; Action B : rendement 15%, σ = 30%) avec ρ = 0,2 (faible corrélation). Un portefeuille 60%A / 40%B a un rendement de 12% et un écart-type de seulement 17,5% — moins risqué que l'action A seule !`,
        formula: "E(Rp) = wA × E(RA) + wB × E(RB)\nσ²p = wA² × σA² + wB² × σB² + 2 × wA × wB × σA × σB × ρAB",
        chart: "EfficientFrontier",
      },
      {
        id: "diversification",
        title: "Le pouvoir de la diversification",
        content: `La diversification est souvent qualifiée de "seul repas gratuit en finance". En combinant des actifs peu corrélés, on réduit le risque sans sacrifier le rendement attendu.

**Risque systématique vs non-systématique.** Le risque d'un actif se décompose en deux parties :
— **Risque non-systématique (spécifique)** : lié aux caractéristiques propres de l'entreprise (mauvaise gestion, scandal, procès). Ce risque **disparaît** avec la diversification.
— **Risque systématique (de marché)** : lié aux facteurs macroéconomiques (récession, inflation, taux). Ce risque **ne peut pas être diversifié**.

**Combien d'actifs faut-il ?** Des études empiriques montrent qu'avec 20-30 actifs bien choisis et peu corrélés, on élimine pratiquement tout le risque non-systématique. Au-delà, les gains marginaux de diversification deviennent négligeables.

**La corrélation internationale.** Investir à l'international offre une diversification supplémentaire, car les cycles économiques des différents pays ne sont pas parfaitement synchronisés. Cependant, lors des crises majeures (2008, 2020), les corrélations entre marchés tendent à converger vers 1 — exactement quand on en a le plus besoin.`,
        chart: "DiversificationEffect",
        tip: "La diversification ne protège pas des krachs systémiques. En mars 2020, quasi tous les actifs ont chuté simultanément. La vraie protection vient des obligations d'État et de l'or.",
      },
      {
        id: "frontiere",
        title: "La frontière efficiente",
        content: `**Le portefeuille à variance minimale** est la combinaison d'actifs qui minimise le risque pour un rendement donné. En faisant varier les poids de tous les actifs disponibles, on obtient un nuage de portefeuilles possibles.

**La frontière efficiente** est la limite supérieure de ce nuage : pour chaque niveau de risque, c'est le portefeuille qui maximise le rendement. Tout portefeuille sous cette frontière est sous-optimal — on peut faire mieux à risque identique.

**Le théorème de séparation en deux fonds.** Markowitz démontre que tous les investisseurs rationnels détiennent une combinaison de seulement deux portefeuilles :
1. Le **portefeuille sans risque** (bons du Trésor)
2. Le **portefeuille risqué optimal** (un point précis sur la frontière efficiente)

La proportion dépend de l'aversion au risque de l'investisseur, mais pas de la composition du portefeuille risqué — c'est le même pour tout le monde !

**La Capital Allocation Line (CAL).** En ajoutant l'actif sans risque, l'ensemble des possibilités devient une droite allant du taux sans risque jusqu'au portefeuille risqué optimal (et au-delà si on emprunte). La pente de cette droite est le **ratio de Sharpe** du portefeuille risqué.`,
        chart: "CapitalMarketLine",
        formula: "Pente CAL = [E(Rp) - Rf] / σp  (Ratio de Sharpe)",
      },
    ],
    keyTakeaways: [
      "La diversification réduit le risque non-systématique sans coût sur le rendement attendu",
      "La formule de variance d'un portefeuille inclut la covariance entre actifs — clé de la diversification",
      "La frontière efficiente représente les portefeuilles optimaux (maximum rendement pour chaque niveau de risque)",
      "Avec 20-30 actifs peu corrélés, on élimine ~90% du risque spécifique",
      "Tous les investisseurs rationnels combinent un actif sans risque avec le même portefeuille risqué optimal",
    ],
    quiz: [
      {
        question: "Pour maximiser les bénéfices de la diversification, les actifs d'un portefeuille devraient idéalement avoir une corrélation :",
        options: ["Proche de +1", "Proche de -1 ou proche de 0", "Exactement égale à 0", "Supérieure à 0,8"],
        correct: 1,
        explanation: "Plus la corrélation est faible (proche de 0) ou négative (proche de -1), plus la diversification réduit efficacement le risque du portefeuille. Avec ρ = -1, on peut théoriquement éliminer tout le risque.",
      },
      {
        question: "La frontière efficiente de Markowitz représente :",
        options: [
          "Les titres ayant le rendement maximum sur les 5 dernières années",
          "Les portefeuilles à risque minimum quelle que soit la composition",
          "Les portefeuilles maximisant le rendement pour chaque niveau de risque donné",
          "Les actions recommandées par les analystes",
        ],
        correct: 2,
        explanation: "La frontière efficiente est l'ensemble des portefeuilles Pareto-optimaux : aucun autre portefeuille ne peut offrir un rendement supérieur pour le même risque, ou un risque inférieur pour le même rendement.",
      },
      {
        question: "Avec combien d'actifs bien sélectionnés élimine-t-on l'essentiel du risque non-systématique ?",
        options: ["5 à 10 actifs", "20 à 30 actifs", "50 à 100 actifs", "Plus de 200 actifs"],
        correct: 1,
        explanation: "Des études empiriques montrent qu'avec 20-30 actifs peu corrélés, on élimine environ 90% du risque spécifique. Au-delà, les gains marginaux de diversification deviennent négligeables.",
      },
      {
        question: "Selon le théorème de séparation en deux fonds de Markowitz, un investisseur rationnel détient toujours :",
        options: [
          "Uniquement l'actif sans risque",
          "Uniquement le portefeuille de marché",
          "Une combinaison d'un actif sans risque et d'un portefeuille risqué optimal identique pour tous",
          "Un portefeuille sur mesure selon ses préférences personnelles",
        ],
        correct: 2,
        explanation: "Tous les investisseurs rationnels détiennent le même portefeuille risqué (point tangent sur la frontière efficiente). Seule la proportion entre cet actif risqué et l'actif sans risque varie selon l'aversion au risque.",
      },
    ],
  },
  {
    id: "capm",
    number: 3,
    title: "Modèles de valorisation (CAPM)",
    subtitle: "Quantifier le risque et estimer les rendements attendus",
    description: "Maîtrisez le Capital Asset Pricing Model, le modèle de référence pour relier risque systématique et rendement attendu.",
    level: "Intermédiaire",
    duration: "30 min",
    icon: "ChartLine",
    color: "#a78bfa",
    sections: [
      {
        id: "beta",
        title: "Le bêta : mesure du risque systématique",
        content: `Le bêta (β) mesure la sensibilité d'un actif aux mouvements du marché. C'est le seul risque que les investisseurs sont rémunérés à prendre, car le risque spécifique peut être éliminé par diversification.

**Interprétation du bêta :**
— β = 1 : l'actif suit parfaitement le marché
— β > 1 : l'actif amplifie les mouvements du marché (plus volatile)
— β < 1 : l'actif amortit les mouvements (moins volatile)
— β < 0 : l'actif évolue en sens inverse du marché (rare, ex : options de vente)

**Exemples réels :**
— Apple : β ≈ 1,2 (plus volatile que le marché)
— Procter & Gamble : β ≈ 0,5 (plus stable, secteur défensif)
— Tesla : β ≈ 1,8 (très volatile)
— Or : β ≈ 0,0 (quasi indépendant du marché actions)

**Estimation du bêta.** On régresse les rendements de l'actif sur les rendements du marché. La pente de cette régression est le bêta. Plus le R² est élevé, plus le risque systématique explique le comportement de l'actif.`,
        formula: "β = Cov(Ri, Rm) / Var(Rm) = ρim × (σi / σm)",
        tip: "Le bêta n'est pas stable dans le temps. Un bêta calculé sur des données historiques peut différer significativement du bêta futur, surtout en période de crise.",
      },
      {
        id: "capm-formule",
        title: "Le CAPM : la formule fondamentale",
        content: `Le **Capital Asset Pricing Model** (CAPM) est le modèle de référence en finance depuis sa publication par William Sharpe en 1964 (Prix Nobel 1990). Il fournit une relation précise entre le risque systématique d'un actif et son rendement attendu.

**Les hypothèses du CAPM :**
1. Marchés compétitifs et efficients
2. Investisseurs rationnels et mean-variance optimizers
3. Horizon d'investissement unique et commun
4. Tous peuvent emprunter/prêter au taux sans risque
5. Pas de taxes, pas de coûts de transaction
6. Anticipations homogènes (tous les investisseurs ont les mêmes prévisions)

**La formule CAPM :** Le rendement attendu d'un actif est la somme du taux sans risque et d'une prime de risque proportionnelle au bêta.

**La prime de risque de marché [E(Rm) - Rf]** est historiquement d'environ 5-7% par an sur les marchés développés. Elle représente la rémunération que les investisseurs exigent pour détenir le portefeuille de marché plutôt que l'actif sans risque.

**Application concrète.** Apple (β = 1,30), taux sans risque Rf = 2%, prime de risque de marché = 6,5% :
E(RApple) = 2% + 1,30 × 6,5% = **10,45%**

Si Apple rapporte moins que 10,45%, elle est sur-valorisée (vendre). Si elle rapporte plus, elle est sous-valorisée (acheter).`,
        formula: "E(Ri) = Rf + βi × [E(Rm) - Rf]\n\nOù :\n- Rf = taux sans risque (OAT 10 ans, T-Bills)\n- βi = bêta de l'actif\n- E(Rm) = rendement attendu du marché\n- [E(Rm) - Rf] = prime de risque de marché",
        chart: "SecurityMarketLine",
      },
      {
        id: "cml-sml",
        title: "CML vs SML : deux visions du risque",
        content: `Le CAPM génère deux droites importantes qui représentent l'équilibre marché, mais mesurent des risques différents.

**La Capital Market Line (CML)** relie le taux sans risque au portefeuille de marché. Elle concerne uniquement les **portefeuilles bien diversifiés** et utilise l'écart-type total σ comme mesure de risque.

**La Security Market Line (SML)** concerne **tous les actifs** (diversifiés ou non) et utilise le bêta comme mesure de risque. La SML est la représentation graphique du CAPM.

**Comment repérer une anomalie :**
— Un actif **au-dessus** de la SML est sous-évalué : son rendement est trop élevé pour son niveau de risque. Le marché va corriger à la hausse son prix.
— Un actif **en-dessous** de la SML est sur-évalué : son rendement est trop faible. Son prix va baisser.

**L'alpha de Jensen.** C'est la distance verticale entre un actif et la SML. Un alpha positif indique une surperformance ajustée du risque. Les gérants actifs cherchent à générer de l'alpha — ce qui est possible mais rare sur le long terme dans des marchés efficaces.`,
        formula: "Alpha (α) = E(Ri) - [Rf + βi × (E(Rm) - Rf)]\n\nAlpha > 0 → actif sous-évalué\nAlpha < 0 → actif sur-évalué",
      },
      {
        id: "fama-french",
        title: "Au-delà du CAPM : Fama-French",
        content: `Le CAPM est élégant mais imparfait. Des décennies de données empiriques montrent des anomalies que le CAPM n'explique pas.

**Les anomalies principales :**
— **L'effet taille (Size Effect)** : les petites capitalisations surperforment les grandes en moyenne, même après ajustement pour le bêta.
— **L'effet valeur (Value Effect)** : les actions à ratio book/market élevé (actions "value") surperforment les actions "growth".
— **L'effet momentum** : les actifs qui ont bien performé récemment tendent à continuer à surperformer.

**Le modèle Fama-French à 3 facteurs (1993).** Fama et French proposent deux facteurs supplémentaires au bêta de marché :
— **SMB** (Small Minus Big) : rendement des petites caps moins celui des grandes
— **HML** (High Minus Low) : rendement des actions value moins celui des actions growth

Ce modèle explique environ 90% de la variabilité des rendements de portefeuilles diversifiés, contre ~70% pour le CAPM seul.

**L'APT (Arbitrage Pricing Theory).** Ross (1976) propose une théorie plus générale basée sur la loi du prix unique : deux actifs avec les mêmes flux de trésorerie doivent avoir le même prix, sinon il existe une opportunité d'arbitrage. L'APT admet plusieurs facteurs de risque sans les préciser — plus flexible que le CAPM mais moins opérationnel.`,
        formula: "Modèle Fama-French :\nRi - Rf = αi + bM × (Rm - Rf) + bSMB × SMB + bHML × HML + εi",
        tip: "En pratique, utilisez le CAPM comme point de départ pour estimer le coût des capitaux propres d'une entreprise. Pour l'analyse de fonds, préférez le modèle Fama-French.",
      },
    ],
    keyTakeaways: [
      "Le bêta mesure la sensibilité au marché — le seul risque rémunéré car le risque spécifique se diversifie",
      "CAPM : E(Ri) = Rf + βi × [E(Rm) - Rf] — formule fondamentale pour valoriser tout actif",
      "La SML permet d'identifier les actifs sur/sous-évalués via l'alpha de Jensen",
      "Le modèle Fama-French ajoute les facteurs taille et valeur pour mieux expliquer les rendements",
      "Un alpha positif persistant est rare dans les marchés efficaces",
    ],
    quiz: [
      {
        question: "Un titre a un bêta de 1,5. La prime de risque de marché est de 6%. Selon le CAPM, la prime de risque attendue pour ce titre est :",
        options: ["6%", "7,5%", "9%", "4%"],
        correct: 2,
        explanation: "Prime de risque = β × (Rm - Rf) = 1,5 × 6% = 9%. Le CAPM récompense uniquement le risque systématique, proportionnel au bêta.",
      },
      {
        question: "Un actif se situe au-dessus de la Security Market Line (SML). Que peut-on en déduire ?",
        options: [
          "L'actif est surévalué, son rendement réalisé est trop élevé",
          "L'actif est sous-évalué, il offre un alpha positif (opportunité d'achat)",
          "L'actif est correctement valorisé par le marché",
          "L'actif est trop risqué pour être investi",
        ],
        correct: 1,
        explanation: "Au-dessus de la SML, l'actif génère un rendement supérieur à ce que son bêta justifie. C'est un alpha positif — il est sous-évalué. Le marché devrait le réévaluer à la hausse.",
      },
      {
        question: "Quelle est la différence principale entre la Capital Market Line (CML) et la Security Market Line (SML) ?",
        options: [
          "La CML utilise le bêta comme mesure de risque, la SML utilise l'écart-type",
          "La CML s'applique aux portefeuilles bien diversifiés (risque total), la SML à tout actif (risque systématique)",
          "La CML est utilisée en gestion passive, la SML en gestion active",
          "Il n'y a pas de différence, ce sont deux noms pour le même concept",
        ],
        correct: 1,
        explanation: "La CML utilise σ (risque total) et ne s'applique qu'aux portefeuilles efficients. La SML utilise β (risque systématique) et s'applique à tout actif ou portefeuille, diversifié ou non.",
      },
      {
        question: "Le modèle Fama-French 3 facteurs améliore le CAPM en ajoutant :",
        options: [
          "La liquidité et le momentum (12 mois)",
          "Le facteur taille (SMB) et le facteur valeur (HML)",
          "La volatilité implicite et les taux de change",
          "Les dividendes et la croissance des bénéfices",
        ],
        correct: 1,
        explanation: "SMB (Small Minus Big) capte la surperformance historique des petites capitalisations. HML (High Minus Low) capte la surperformance des titres value (faible Price-to-Book). Ces deux facteurs expliquent une part significative des rendements non captés par le bêta.",
      },
    ],
  },
  {
    id: "efficience",
    number: 4,
    title: "Efficience des marchés & biais cognitifs",
    subtitle: "Peut-on battre le marché systématiquement ?",
    description: "Comprenez pourquoi battre le marché est difficile, quelles anomalies persistent, et comment nos biais psychologiques nous font perdre de l'argent.",
    level: "Intermédiaire",
    duration: "20 min",
    icon: "Brain",
    color: "#d9a441",
    sections: [
      {
        id: "emh",
        title: "L'hypothèse d'efficience des marchés (EMH)",
        content: `**Un marché est efficient** lorsque les prix reflètent instantanément toute l'information disponible. Si c'est vrai, analyser des actions pour trouver des "bonnes affaires" est inutile : tout est déjà dans le cours.

**Intuition fondamentale.** Si une information prévisible fait monter un titre, les investisseurs achèteront dès aujourd'hui, faisant monter le prix immédiatement. L'information future n'est donc pas dans le prix actuel — seule l'information nouvelle, par nature imprévisible, fait bouger les marchés. Les cours suivent donc une **marche aléatoire** (random walk).

**Les 3 formes de l'EMH :**

**Forme faible** : les prix reflètent tout l'historique des prix et volumes. Conséquence : l'analyse technique (chartisme) ne peut pas générer de surperformance systématique.

**Forme semi-forte** : les prix reflètent toute l'information publique (résultats, dividendes, annonces, ratios financiers). Conséquence : l'analyse fondamentale ne peut pas générer de surperformance systématique.

**Forme forte** : les prix reflètent toute l'information, y compris privée (initiés). Conséquence : même les initiés ne peuvent pas battre le marché. (Forme la plus contestée — les délits d'initiés existent et sont rentables avant d'être détectés.)`,
        tip: "Le test classique de la forme faible : les prix passés prédisent-ils les prix futurs ? La réponse est non pour les grandes capitalisations — mais certains effets comme le momentum semblent persister.",
      },
      {
        id: "anomalies",
        title: "Les anomalies de marché",
        content: `Malgré la théorie de l'EMH, des **anomalies persistantes** ont été documentées par des dizaines d'études académiques.

**L'effet Janvier.** Les actions, surtout les small caps, surperforment en janvier. Explication possible : les investisseurs vendent en décembre pour des raisons fiscales (cristalliser des moins-values) et rachètent en janvier.

**L'effet taille (Size Effect).** Les petites capitalisations ont historiquement généré des rendements supérieurs aux grandes. Débat : est-ce une vraie anomalie ou une juste rémunération du risque plus élevé et de la moindre liquidité ?

**L'effet valeur (Value Effect).** Les actions avec un faible ratio cours/valeur comptable surperforment à long terme. Graham et Dodd l'avaient empiriquement observé dès les années 1930. Warren Buffett en est l'illustrateur le plus célèbre.

**L'effet momentum.** Les actifs qui ont le mieux performé sur les 3-12 derniers mois tendent à continuer à surperformer. Difficile à expliquer par des modèles rationnels — souvent attribué à des biais comportementaux.

**Pourquoi ces anomalies persistent-elles ?** Si elles étaient facilement exploitables, les arbitrageurs les feraient disparaître. Plusieurs raisons à leur persistance : coûts de transaction, risque d'arbitrage, contraintes réglementaires, et peut-être la compensation légitime d'un risque non capturé par le CAPM.`,
      },
      {
        id: "biais",
        title: "Finance comportementale : nos biais cognitifs",
        content: `La finance comportementale, développée par Daniel Kahneman (Prix Nobel 2002), montre que les investisseurs ne sont pas rationnels. Voici les biais les plus coûteux :

**Excès de confiance.** Les investisseurs surestiment leur capacité à prévoir les marchés et à sélectionner des titres. Les hommes sont en moyenne plus touchés que les femmes. Conséquence : over-trading, coûts de transaction excessifs, portefeuilles sous-diversifiés.

**Aversion aux pertes.** Une perte de 100€ est ressentie comme deux fois plus douloureuse qu'un gain de 100€ ne procure de satisfaction (Kahneman & Tversky, 1979). Conséquences : on garde trop longtemps les positions perdantes ("ça va remonter") et on vend trop vite les gagnantes ("prendre ses bénéfices").

**L'effet de disposition.** Extension de l'aversion aux pertes : les investisseurs ont tendance à réaliser leurs gains et à conserver leurs pertes. Fiscalement et économiquement sous-optimal.

**La comptabilité mentale.** On traite différemment l'argent selon son origine ou sa destination. "L'argent gagné au casino" est dépensé plus facilement que le salaire. En investissement : on garde des actions héritées auxquelles on est émotionnellement attaché, même si ce n'est pas optimal.

**Le biais de représentativité.** On extrapole excessivement les tendances récentes. Après une bonne année boursière, on anticipe une autre bonne année. Résultat : acheter haut et vendre bas — l'inverse de la stratégie gagnante.

**L'ancrage.** Le prix auquel on a acheté une action devient une référence mentale absurde. "Je vendrai quand je serai revenu à l'équilibre" — mais le marché ignore votre prix d'achat.`,
        tip: "Automatiser ses investissements (DCA mensuel automatique) est le meilleur moyen d'éviter les biais comportementaux. On ne peut pas faire de mauvaises décisions émotionnelles si la décision est déjà programmée.",
      },
    ],
    keyTakeaways: [
      "Un marché efficient intègre instantanément toute information disponible dans les prix",
      "Les 3 formes de l'EMH impliquent que ni l'analyse technique ni l'analyse fondamentale ne génèrent systématiquement de l'alpha",
      "Des anomalies persistantes existent (taille, valeur, momentum) mais sont difficiles à exploiter après frais",
      "Nos biais cognitifs (aversion aux pertes, excès de confiance) sont nos pires ennemis en investissement",
      "La solution : automatiser, diversifier, et ne pas surveiller son portefeuille trop fréquemment",
    ],
    quiz: [
      {
        question: "La forme semi-forte de l'hypothèse d'efficience des marchés (EMH) implique qu'il est impossible de battre le marché en utilisant :",
        options: [
          "Des informations internes non publiques",
          "L'analyse des prix et volumes historiques",
          "L'analyse fondamentale basée sur les données publiques (bilans, rapports)",
          "L'intelligence artificielle et le machine learning",
        ],
        correct: 2,
        explanation: "La forme semi-forte stipule que les prix reflètent toutes les informations publiques. Ni l'analyse technique (forme faible) ni l'analyse fondamentale publique (forme semi-forte) ne permettent de générer un alpha persistant.",
      },
      {
        question: "L'effet momentum (les titres récemment performants continuent de surperformer à court terme) est :",
        options: [
          "Une preuve que les marchés sont parfaitement efficients",
          "Une anomalie documentée, difficile à réconcilier avec l'EMH",
          "Uniquement observé sur les marchés crypto",
          "Expliqué entièrement par le risque systématique (bêta)",
        ],
        correct: 1,
        explanation: "Le momentum est l'une des anomalies les plus robustes en finance empirique. Documenté sur de nombreux marchés et périodes, il suggère que les marchés ne sont pas parfaitement efficients — peut-être dû à des réactions trop lentes des investisseurs.",
      },
      {
        question: "L'excès de confiance (overconfidence) en finance comportementale conduit les investisseurs à :",
        options: [
          "Trop diversifier leur portefeuille",
          "Sous-estimer les risques, surtrader et générer des frais excessifs",
          "Préférer systématiquement les obligations aux actions",
          "Attendre trop longtemps avant d'investir",
        ],
        correct: 1,
        explanation: "Les investisseurs trop confiants pensent avoir des informations ou capacités supérieures. Résultat : ils tradent plus que nécessaire (augmentant les frais), concentrent leur portefeuille, et sous-estiment les risques.",
      },
      {
        question: "Selon les données empiriques sur 20 ans, la stratégie qui performe le mieux en net (après frais) pour l'investisseur particulier est :",
        options: [
          "La gestion active par des gérants professionnels",
          "Le stock-picking basé sur l'analyse fondamentale",
          "L'investissement passif dans des ETF indiciels à faibles frais",
          "L'arbitrage statistique (quant trading)",
        ],
        correct: 2,
        explanation: "90% des fonds actifs sous-performent leur indice de référence sur 20 ans après frais. Les ETF indiciels (ex. SPY sur le S&P 500) avec des frais de 0,03%-0,1%/an surpassent la grande majorité des gérants actifs sur longue période.",
      },
    ],
  },
  {
    id: "gestion",
    number: 5,
    title: "Gestion de portefeuille en pratique",
    subtitle: "Performance, rééquilibrage et stratégies d'investissement",
    description: "Des outils pour mesurer la performance ajustée du risque et les stratégies concrètes pour gérer votre portefeuille au quotidien.",
    level: "Intermédiaire",
    duration: "20 min",
    icon: "Gear",
    color: "#f97316",
    sections: [
      {
        id: "actif-passif",
        title: "Gestion active vs gestion passive",
        content: `**La gestion passive** consiste à répliquer un indice (S&P 500, CAC 40) via des ETF à très faibles frais. L'hypothèse sous-jacente : les marchés sont suffisamment efficients pour qu'il soit difficile de les battre après frais.

**La gestion active** consiste à sélectionner des titres et/ou à timer le marché pour surperformer l'indice. Elle implique des recherches approfondies, un turnover élevé et des frais de gestion plus importants.

**Les faits empiriques sont sans équivoque.** Sur 20 ans, plus de 90% des fonds actifs sous-performent leur indice de référence après frais. La raison : l'investissement est un jeu à somme nulle. Pour chaque acheteur qui fait une bonne affaire, il y a un vendeur qui en fait une mauvaise — et les professionnels jouent contre d'autres professionnels.

**Quelques arguments pour la gestion active :**
— Marchés moins efficients dans certains segments (small caps, marchés émergents)
— Avantage informationnel possible pour des gérants spécialisés
— Valeur ajoutée dans la gestion du risque et du drawdown

**Le verdict de Warren Buffett.** Dans son testament, il a stipulé que 90% des fonds légués à sa femme soient investis dans un ETF S&P 500 à faibles frais. C'est peut-être la meilleure recommandation possible venant du meilleur stock-picker de l'histoire.`,
      },
      {
        id: "mesures",
        title: "Mesurer la performance ajustée du risque",
        content: `Comparer des rendements bruts sans considérer le risque pris est trompeur. Un fonds à +20% mais très volatile n'est pas nécessairement meilleur qu'un fonds à +15% mais stable.

**Le ratio de Sharpe** mesure le surplus de rendement par unité de risque total. Un ratio de Sharpe de 1 ou plus est généralement considéré comme bon. Limite : utilise l'écart-type, donc pénalise autant la volatilité à la hausse qu'à la baisse.

**Le ratio de Treynor** mesure le surplus de rendement par unité de risque systématique (bêta). Plus approprié pour évaluer des portefeuilles bien diversifiés, où seul le risque systématique subsiste.

**L'alpha de Jensen** mesure la surperformance ajustée du risque par rapport au CAPM. Un alpha positif signifie que le gérant a créé de la valeur au-delà de ce qu'expliquerait son niveau de risque.

**L'Information Ratio** divise l'alpha par le risque actif (tracking error). Il mesure la consistance de la surperformance. Un bon gérant actif devrait avoir un IR > 0,5.

**Le Sortino Ratio** améliore le ratio de Sharpe en ne pénalisant que la volatilité négative (drawdowns), pas la volatilité positive. Plus adapté aux stratégies asymétriques.`,
        formula: "Sharpe = (Rp - Rf) / σp\nTreynor = (Rp - Rf) / βp\nAlpha de Jensen = Rp - [Rf + βp × (Rm - Rf)]\nInformation Ratio = Alpha / Tracking Error",
      },
      {
        id: "strategies",
        title: "Stratégies d'investissement concrètes",
        content: `**Buy & Hold.** La stratégie la plus simple : acheter un portefeuille diversifié et le conserver indéfiniment. Avantages : faibles frais, pas de décisions émotionnelles, pleine exposition à la croissance long terme des marchés. L'indice S&P 500 a rapporté en moyenne +10% par an depuis 1926, dividendes réinvestis.

**Dollar Cost Averaging (DCA).** Investir une somme fixe à intervalles réguliers (mensuellement par exemple), indépendamment du niveau du marché. Quand les marchés baissent, on achète plus d'unités pour le même prix. Psychologiquement plus facile que le lump sum investing, et efficace pour éviter d'investir au pire moment.

**Rééquilibrage.** Un portefeuille initialement 60% actions / 40% obligations dérivera naturellement si les actions surperforment. Le rééquilibrage annuel ou semestriel permet de restaurer les proportions cibles, ce qui mécaniquement force à vendre ce qui a monté et acheter ce qui a baissé — une forme disciplinée de "buy low, sell high".

**Stratégie factorielle (Smart Beta).** Exposer son portefeuille aux facteurs académiquement prouvés (valeur, taille, momentum, qualité, faible volatilité) via des ETF spécialisés. Coût intermédiaire entre gestion passive pure et gestion active.

**Gestion du drawdown.** Le drawdown maximal est la plus grande perte du pic au creux. Un portefeuille avec 60% actions a historiquement subi des drawdowns de -30% à -50% lors des grandes crises. La tolérance à ces drawdowns doit être anticipée — c'est souvent au pire moment que les investisseurs paniquent et vendent.`,
        tip: "La règle d'or : votre allocation actions doit être telle que vous pouvez supporter de voir 50% de cette part disparaître temporairement sans vendre. Si ce n'est pas le cas, réduisez la poche actions.",
      },
    ],
    keyTakeaways: [
      "Sur 20 ans, 90% des fonds actifs sous-performent leur indice de référence après frais",
      "Ratio de Sharpe, Treynor et alpha de Jensen : trois façons de mesurer la performance ajustée du risque",
      "Le DCA (investissement mensuel régulier) est psychologiquement et statistiquement efficace",
      "Le rééquilibrage annuel discipline le processus d'investissement et améliore le rendement ajusté du risque",
      "Définissez votre tolérance au drawdown avant d'investir, pas pendant une crise",
    ],
    quiz: [
      {
        question: "Le ratio de Sharpe d'un portefeuille se calcule comme :",
        options: [
          "(Rendement portefeuille - Taux sans risque) / Bêta",
          "(Rendement portefeuille - Taux sans risque) / Écart-type du portefeuille",
          "Rendement portefeuille - [Taux sans risque + β × (Rm - Rf)]",
          "Rendement actif / Rendement de l'indice de référence",
        ],
        correct: 1,
        explanation: "Le ratio de Sharpe = (Rp - Rf) / σp. Il mesure le rendement excédentaire par unité de risque total. Un Sharpe > 1 est généralement considéré comme bon.",
      },
      {
        question: "L'alpha de Jensen d'un portefeuille mesure :",
        options: [
          "La volatilité du portefeuille par rapport au marché",
          "Le rendement excédentaire par rapport au CAPM (surperformance ajustée du risque)",
          "Le ratio rendement/risque global",
          "La corrélation entre le portefeuille et son indice de référence",
        ],
        correct: 1,
        explanation: "Alpha de Jensen = Rp - [Rf + β(Rm - Rf)]. Un alpha positif signifie que le portefeuille surperforme ce que son risque systématique (bêta) devrait générer selon le CAPM.",
      },
      {
        question: "Le Dollar-Cost Averaging (DCA) est une stratégie qui consiste à :",
        options: [
          "Investir la totalité de son capital en une fois pour maximiser l'exposition",
          "Investir des montants fixes à intervalles réguliers, quelle que soit la situation du marché",
          "Acheter uniquement lors des baisses de marché",
          "Rééquilibrer son portefeuille tous les mois",
        ],
        correct: 1,
        explanation: "Le DCA consiste à investir par exemple 500€/mois automatiquement. Avantages : on achète plus de parts quand les prix sont bas, on évite les biais comportementaux, et on ne cherche pas à timer le marché.",
      },
      {
        question: "Pourquoi le rééquilibrage annuel d'un portefeuille améliore-t-il les rendements à long terme ?",
        options: [
          "Il permet de concentrer le portefeuille sur les meilleures positions",
          "Il force à acheter les actifs qui ont sous-performé (baissé) et vendre ceux qui ont surperformé",
          "Il réduit les frais de transaction en limitant les opérations",
          "Il augmente mécaniquement la duration du portefeuille",
        ],
        correct: 1,
        explanation: "Le rééquilibrage force à vendre haut (les actifs surperformants qui dépassent leur allocation cible) et acheter bas (les actifs sous-performants). C'est une discipline mécanique qui exploite la mean-reversion.",
      },
    ],
  },
  {
    id: "obligations",
    number: 6,
    title: "Comprendre les obligations",
    subtitle: "Analyse obligataire et gestion du risque de taux",
    description: "Maîtrisez la mécanique des obligations, la relation prix/taux, la duration et les stratégies obligataires pour équilibrer votre portefeuille.",
    level: "Intermédiaire",
    duration: "25 min",
    icon: "Scroll",
    color: "#06b6d4",
    sections: [
      {
        id: "mecanisme",
        title: "Mécanique d'une obligation",
        content: `Une **obligation** est un titre de créance : l'émetteur (État, entreprise) emprunte de l'argent et s'engage à rembourser le **principal** (valeur nominale) à l'**échéance**, tout en versant des **coupons** (intérêts) périodiques.

**Caractéristiques clés :**
— **Valeur nominale (face value)** : montant remboursé à l'échéance (souvent 1 000€)
— **Taux de coupon** : intérêt annuel exprimé en % de la valeur nominale
— **Maturité** : date de remboursement du principal
— **Prix** : valeur de marché de l'obligation (peut différer de la valeur nominale)

**Exemple concret.** OAT 10 ans française à 3% : coupon de 30€ par an pour une valeur nominale de 1 000€, remboursement dans 10 ans.

**Taux de rendement (YTM — Yield to Maturity).** C'est le taux d'actualisation qui égalise le prix de l'obligation avec la valeur actualisée de tous ses flux futurs (coupons + remboursement). C'est le vrai rendement que vous obtenez si vous achetez aujourd'hui et conservez jusqu'à l'échéance.

**Obligations d'État vs obligations d'entreprise.** Les obligations d'État des pays développés sont considérées sans risque de défaut. Les obligations d'entreprise comportent un risque de crédit, compensé par un **spread** (supplément de taux par rapport au taux sans risque).`,
        formula: "Prix = Σ [Coupon / (1+YTM)^t] + [Valeur_nominale / (1+YTM)^n]",
      },
      {
        id: "prixytm",
        title: "La relation inverse prix/taux",
        content: `**La règle fondamentale des obligations : quand les taux montent, les prix baissent, et vice versa.** Cette relation est mécanique et découle directement de la formule d'actualisation.

**Intuition.** Vous détenez une obligation à 3% émise quand les taux étaient à 3%. Si les taux de marché montent à 5%, votre obligation à 3% est moins attractive — personne ne voudra la payer à la valeur nominale. Son prix doit baisser pour que son rendement effectif corresponde aux 5% du marché.

**Le risque de taux.** Un investisseur qui achète une obligation et la revend avant l'échéance est exposé à ce risque. Si les taux ont monté entre l'achat et la vente, il vendra à perte. En revanche, s'il conserve jusqu'à l'échéance, il récupère exactement la valeur nominale (sauf défaut).

**Amplitude de la sensibilité.** Plus la maturité est longue, plus l'obligation est sensible aux variations de taux. Une obligation à 30 ans verra son prix chuter beaucoup plus qu'une obligation à 2 ans pour la même hausse de taux.`,
        chart: "BondPriceDuration",
        tip: "En période de taux bas (comme 2015-2022), les obligations longues étaient très attractives comme protection. Quand les banques centrales ont relevé les taux en 2022, les détenteurs d'obligations longues ont subi des pertes importantes.",
      },
      {
        id: "duration",
        title: "Duration et sensibilité aux taux",
        content: `**La duration de Macaulay** est la durée de vie moyenne pondérée des flux de trésorerie d'une obligation. Elle intègre à la fois la maturité et le taux de coupon.

**La duration modifiée (D*)** mesure directement la sensibilité du prix aux variations de taux. Si la duration modifiée est 7 ans, une hausse de taux de 1% entraîne une baisse du prix d'environ 7%.

**Facteurs influençant la duration :**
— Plus la maturité est longue → duration plus élevée → plus sensible
— Plus le coupon est élevé → duration plus faible (les flux arrivent tôt)
— Plus le YTM est élevé → duration plus faible

**La convexité.** La relation prix/taux n'est pas linéaire mais convexe. La duration donne une approximation linéaire ; la convexité permet d'affiner cette approximation. Un investisseur préfère les obligations à forte convexité car elles baissent moins que prévu quand les taux montent et montent plus que prévu quand les taux baissent.

**Stratégies de gestion du risque de taux :**

**Immunisation** : construction d'un portefeuille dont la duration correspond à l'horizon d'investissement, annulant le risque de taux.

**Bond laddering** : répartir les maturités régulièrement (1, 3, 5, 7, 10 ans). Chaque année, les obligations arrivant à maturité sont réinvesties aux taux du moment. Bonne protection contre le risque de réinvestissement.`,
        formula: "Duration modifiée (D*) = Duration Macaulay / (1 + YTM)\nΔP/P ≈ -D* × Δy\n\nExemple : D* = 7, hausse de taux de 0,5%\nΔP/P ≈ -7 × 0,5% = -3,5%",
      },
    ],
    keyTakeaways: [
      "Le YTM est le vrai rendement d'une obligation si conservée jusqu'à l'échéance",
      "Relation fondamentale : taux montant ↔ prix obligataire baissant",
      "La duration modifiée mesure la sensibilité : une D* de 7 signifie -7% de prix pour +1% de taux",
      "Plus la maturité est longue et le coupon faible, plus la duration est élevée",
      "L'immunisation et le bond laddering sont les deux stratégies principales de gestion du risque de taux",
    ],
    quiz: [
      {
        question: "Quand les taux d'intérêt du marché augmentent de 1%, que se passe-t-il pour le prix d'une obligation existante ?",
        options: [
          "Il augmente proportionnellement",
          "Il reste stable (l'obligation est déjà émise)",
          "Il baisse, car les flux futurs sont actualisés à un taux plus élevé",
          "Il varie uniquement si l'obligation est à taux variable",
        ],
        correct: 2,
        explanation: "Le prix d'une obligation est la valeur actualisée de ses flux futurs (coupons + remboursement). Si le taux d'actualisation augmente, la valeur présente de ces flux diminue mécaniquement. C'est la relation inverse prix/taux.",
      },
      {
        question: "Une obligation a une duration modifiée de 6. Si les taux montent de 0,5%, l'impact approximatif sur son prix est :",
        options: [
          "Hausse de 3%", "Baisse de 3%", "Hausse de 0,5%", "Baisse de 0,5%"
        ],
        correct: 1,
        explanation: "ΔP/P ≈ -D* × Δy = -6 × 0,5% = -3%. La duration modifiée est un multiplicateur de sensibilité : chaque hausse de taux de 1% entraîne une baisse de prix de D*%.",
      },
      {
        question: "Quelle obligation est la PLUS sensible aux variations de taux d'intérêt ?",
        options: [
          "Obligation à coupon élevé (8%) et courte maturité (2 ans)",
          "Obligation à coupon élevé (8%) et longue maturité (20 ans)",
          "Obligation à coupon faible (2%) et longue maturité (20 ans)",
          "Obligation à coupon faible (2%) et courte maturité (2 ans)",
        ],
        correct: 2,
        explanation: "La duration augmente avec la maturité (on attend plus longtemps les flux) et diminue avec le coupon (les coupons élevés ramènent les flux plus tôt). Une obligation à faible coupon et longue maturité a donc la duration maximale.",
      },
      {
        question: "L'immunisation d'un portefeuille obligataire consiste à :",
        options: [
          "Acheter uniquement des obligations d'État notées AAA",
          "Faire correspondre la duration du portefeuille avec l'horizon d'investissement",
          "Diversifier entre obligations courtes et longues en parts égales",
          "Couvrir le risque de crédit avec des CDS",
        ],
        correct: 1,
        explanation: "En alignant la duration du portefeuille avec l'horizon d'investissement, on neutralise l'effet des variations de taux : la perte en capital est compensée par le réinvestissement des coupons à un taux plus favorable (et vice versa).",
      },
    ],
  },
  {
    id: "derives",
    number: 7,
    title: "Options, Futures & Dérivés",
    subtitle: "Instruments de couverture et de spéculation",
    description: "Comprenez les produits dérivés (options, futures), leurs payoffs, leurs stratégies et leur utilisation pour couvrir un portefeuille.",
    level: "Avancé",
    duration: "35 min",
    icon: "ArrowsLeftRight",
    color: "#e5484d",
    sections: [
      {
        id: "options-bases",
        title: "Les options : droits sans obligations",
        content: `Un **contrat d'option** donne à son détenteur le **droit, mais pas l'obligation**, d'acheter ou de vendre un actif à un prix déterminé (prix d'exercice ou strike) avant ou à une date donnée (échéance), contre le paiement d'une **prime** (premium).

**Option d'achat (Call).** Donne le droit d'acheter l'actif au prix d'exercice X. L'acheteur espère que le prix montera au-delà de X + prime payée. Au-delà de ce seuil de rentabilité, le profit est théoriquement illimité.

**Option de vente (Put).** Donne le droit de vendre l'actif au prix d'exercice X. L'acheteur espère que le prix tombera en-dessous de X - prime payée. C'est une forme d'assurance contre la baisse.

**La moneyness d'une option :**
— **In the Money (ITM)** : l'exercice immédiat est profitable. Call : cours > X. Put : cours < X.
— **At the Money (ATM)** : cours ≈ X
— **Out of the Money (OTM)** : l'exercice immédiat n'est pas profitable

**Options américaines vs européennes.** Les options américaines peuvent être exercées à tout moment avant l'échéance. Les options européennes uniquement à l'échéance. Les options américaines valent au moins autant que les européennes.

**La valeur d'une option.** Elle se décompose en valeur intrinsèque (gain immédiat si exercée maintenant) et valeur temps (probabilité que l'option finisse ITM avant l'échéance). Plus on s'éloigne de l'échéance, plus la valeur temps est grande.`,
        formula: "Payoff Call à l'échéance = max(S_T - X, 0)\nPayoff Put à l'échéance = max(X - S_T, 0)\n\nProfit Call = max(S_T - X, 0) - Prime_payée\nProfit Put = max(X - S_T, 0) - Prime_payée",
        chart: "OptionPayoff",
      },
      {
        id: "strategies-options",
        title: "Stratégies avec options",
        content: `Les options permettent de construire des profils de gain/perte très variés, adaptés à différentes visions de marché.

**Le Protective Put (assurance portefeuille).** Vous détenez une action et achetez un put au même prix d'exercice. Si l'action chute, le put compense les pertes. Si elle monte, vous profitez pleinement. Coût : la prime du put. C'est exactement comme souscrire une assurance sur votre portefeuille.

**Le Straddle (pari sur la volatilité).** Achat simultané d'un call et d'un put au même prix d'exercice et à la même échéance. Vous gagnez si le prix évolue fortement dans un sens ou dans l'autre — vous pariez sur la volatilité, pas sur la direction. Typiquement utilisé avant une annonce de résultats incertaine.

**Le Bull Spread.** Achat d'un call à prix d'exercice X₁ et vente d'un call à X₂ (X₁ < X₂). Vous limitez votre gain maximal (au-delà de X₂), mais vous réduisez le coût net. Vision : légère hausse du marché.

**La parité put-call.** Relation fondamentale qui lie le prix d'un call, d'un put, de l'action et de l'actif sans risque. Si cette relation est violée, il existe une opportunité d'arbitrage. C'est un pilier de la valorisation des options.`,
        formula: "Parité put-call :\nS₀ + P₀ = C₀ + X × e^(-rT)\n\nOù :\n- S₀ = prix actuel de l'action\n- P₀ = prix du put\n- C₀ = prix du call\n- X = prix d'exercice\n- r = taux sans risque\n- T = temps jusqu'à l'échéance",
      },
      {
        id: "blackscholes",
        title: "Le modèle Black-Scholes",
        content: `Fisher Black et Myron Scholes publient en 1973 la formule révolutionnaire qui valorise les options européennes. Robert Merton contribue simultanément. Scholes et Merton recevront le Prix Nobel en 1997 (Black est décédé en 1995).

**L'intuition.** À chaque instant, on peut créer un portefeuille composé de l'option et d'une certaine quantité d'actions (le hedge ratio) tel que ce portefeuille est instantanément sans risque. Ce portefeuille doit donc rapporter le taux sans risque — sans quoi il y aurait arbitrage.

**Les hypothèses du modèle :**
— Le prix de l'actif suit un mouvement brownien géométrique (log-normale)
— La volatilité σ est constante
— Les taux d'intérêt sont constants
— Pas de dividendes
— Marchés continus, sans coûts de transaction

**Les sensibilités (les "Greeks") :**
— **Delta (Δ)** : sensibilité du prix de l'option au prix de l'actif. Call : entre 0 et 1. Put : entre -1 et 0.
— **Gamma (Γ)** : sensibilité du delta au prix de l'actif. Mesure la non-linéarité.
— **Theta (Θ)** : sensibilité au temps (time decay). Les options perdent de la valeur avec le temps.
— **Vega (ν)** : sensibilité à la volatilité. Les deux types d'options gagnent de la valeur quand la volatilité augmente.

**La volatilité implicite.** En pratique, on observe le prix des options sur le marché et on en déduit la volatilité σ — c'est la volatilité que le marché "attend" pour l'avenir. Le VIX est l'indice de volatilité implicite du S&P 500, souvent appelé "l'indice de la peur".`,
        formula: "Prix Call = S₀ × N(d₁) - X × e^(-rT) × N(d₂)\nPrix Put = X × e^(-rT) × N(-d₂) - S₀ × N(-d₁)\n\nd₁ = [ln(S₀/X) + (r + σ²/2)T] / (σ√T)\nd₂ = d₁ - σ√T\n\nN(d) = fonction de répartition de la loi normale",
      },
      {
        id: "futures",
        title: "Futures et Forwards",
        content: `**Un contrat forward** est un accord privé entre deux parties pour acheter/vendre un actif à une date future à un prix convenu aujourd'hui. Customisé, non standardisé, risque de contrepartie.

**Un contrat futures** est similaire mais standardisé et négocié sur une bourse organisée. Une chambre de compensation garantit l'exécution des contrats, éliminant le risque de contrepartie.

**Le mark-to-market.** Chaque jour, les positions futures sont valorisées aux prix de marché et les gains/pertes sont crédités/débités sur les comptes de marge. Si le solde tombe sous la marge de maintenance, l'investisseur reçoit un margin call.

**Prix théorique d'un forward.** Il est déterminé par une condition de non-arbitrage : le rendement du forward doit égaler celui d'acheter l'actif comptant et le financer par emprunt.

**Utilisation en couverture (hedging) :**

**Couverture d'un portefeuille actions.** Un gérant craint une baisse de marché à court terme. Il vend des contrats futures sur indice. Ratio de couverture = Valeur portefeuille × β / Valeur d'un contrat. Exemple : portefeuille de 30M€, β = 0,8, indice à 5 000 points, contrat de 5 000 points × 100€ = 500 000€ → il faut vendre 48 contrats.

**Couverture de taux d'intérêt.** Pour protéger un portefeuille obligataire contre une hausse des taux : vendre des contrats futures sur obligations. Ratio de couverture basé sur la PVBP (Price Value of a Basis Point).`,
        formula: "Prix Forward = S₀ × (1 + r - d)^T\n\nOù :\n- S₀ = prix spot\n- r = taux sans risque\n- d = taux de dividende\n- T = maturité\n\nRatio de couverture actions = Valeur_portefeuille × β / Valeur_contrat",
        tip: "Les dérivés ne créent pas de richesse — ils la redistribuent. Pour chaque acheteur gagnant, il y a un vendeur perdant (jeu à somme nulle). Leur valeur est dans la couverture des risques, pas dans la spéculation.",
      },
    ],
    keyTakeaways: [
      "Une option est un droit sans obligation — l'acheteur paye une prime pour ce privilège",
      "Payoff call = max(S-X, 0) ; Payoff put = max(X-S, 0)",
      "La parité put-call lie mécaniquement les prix des options d'achat et de vente",
      "Black-Scholes révolutionne la valorisation des options en 1973 — basé sur la création d'un portefeuille sans risque",
      "Les futures permettent de couvrir un portefeuille actions ou obligataire avec un ratio de couverture précis",
    ],
    quiz: [
      {
        question: "Le payoff à l'expiration d'un call de strike X = 100 € sur un actif valant S = 120 € est :",
        options: ["0 €", "20 €", "-20 €", "120 €"],
        correct: 1,
        explanation: "Payoff call = max(S - X, 0) = max(120 - 100, 0) = 20 €. L'acheteur exerce l'option car il peut acheter à 100 € un actif qui vaut 120 €.",
      },
      {
        question: "La parité put-call (S + P = C + X × e^(-rT)) implique que :",
        options: [
          "Les puts valent toujours plus que les calls",
          "On peut répliquer un call en combinant un put, l'actif sous-jacent et un emprunt",
          "Les calls et puts ont toujours le même prix",
          "La volatilité implicite est identique pour tous les strikes",
        ],
        correct: 1,
        explanation: "La parité put-call est une relation d'arbitrage : un portefeuille {long put, long actif, emprunt de X × e^(-rT)} a exactement le même payoff qu'un call. Si ce n'était pas le cas, il y aurait une opportunité d'arbitrage.",
      },
      {
        question: "Un investisseur achète simultanément un call et un put sur le même actif, même strike, même maturité (straddle). Cette stratégie est profitable quand :",
        options: [
          "L'actif monte modérément",
          "Le marché reste stable autour du strike",
          "La volatilité réalisée est forte (forte hausse ou forte baisse)",
          "Les taux d'intérêt baissent",
        ],
        correct: 2,
        explanation: "Le straddle perd sa prime si le marché reste stable. Il gagne si l'actif s'éloigne suffisamment du strike dans l'une ou l'autre direction pour dépasser le coût des deux primes payées.",
      },
      {
        question: "Le VIX, souvent appelé 'indice de la peur', mesure :",
        options: [
          "La volatilité historique réalisée du S&P 500 sur 30 jours",
          "La volatilité implicite du S&P 500 extraite des prix d'options à 30 jours",
          "Le momentum baissier du marché américain",
          "La corrélation entre actions et obligations en période de crise",
        ],
        correct: 1,
        explanation: "Le VIX est calculé à partir des prix des options sur le S&P 500 à environ 30 jours d'échéance. Il mesure ce que le marché 'attend' comme volatilité future — pas ce qui s'est passé. Un VIX > 30 signale une forte incertitude.",
      },
    ],
  },
];

export function getModule(id: string): Module | undefined {
  return MODULES.find(m => m.id === id);
}

export function getModuleByNumber(num: number): Module | undefined {
  return MODULES.find(m => m.number === num);
}
