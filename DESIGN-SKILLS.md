# Guide de sélection des skills design UI/UX

Ce document est destiné à être lu par Claude. Quand l'utilisateur demande de créer, améliorer ou retravailler un design, utilise ce guide pour choisir automatiquement le ou les skills les plus adaptés au contexte.

---

## Règle générale

Avant toute tâche de design, identifie :
1. **L'action** — construire from scratch, améliorer l'existant, choisir une esthétique, présenter
2. **Le stack** — React/Next.js, Vue, Svelte, HTML/CSS, Flutter, Swift, shadcn/ui...
3. **L'esthétique voulue** — premium/luxe, épuré, brutaliste, neutre

Combine toujours un **skill builder** avec un **skill de style** si l'utilisateur a une esthétique en tête.

---

## 1. Construire un site from scratch

| Stack | Skill principal | Ajouter si esthétique précise |
|-------|----------------|-------------------------------|
| React / Next.js | `/taste-skill` | + `/soft-skill` ou `/minimalist-skill` ou `/brutalist-skill` |
| shadcn/ui + Tailwind | `/ui-styling` | + un skill de style |
| Vue, Svelte, Flutter, Swift, HTML/CSS | `/ui-ux-pro-max` | + un skill de style |
| N'importe quel stack, qualité maximale | `/impeccable craft` | — (il gère l'esthétique lui-même) |

**`/taste-skill`** — Défaut pour React/Next.js. Impose l'architecture (Server Components, hardware acceleration CSS, vérification des dépendances). Paramètres configurables : variance design (8/10), intensité motion (6/10), densité visuelle (4/10).

**`/ui-ux-pro-max`** — Défaut multi-stack. 10 frameworks supportés, 161 palettes, 57 font pairings, 99 UX guidelines. À utiliser quand le stack n'est pas React ou quand on veut des recommandations sur les couleurs/typographie/composants.

**`/ui-styling`** — Spécialisé shadcn/ui + Radix UI + Tailwind. Gère les composants accessibles (dialogs, dropdowns, tables, forms), le theming, le dark mode.

**`/impeccable craft`** — Approche "shape-first" : réfléchit à la forme avant de coder. Anti-patterns IA activement bloqués. Pour du très haut de gamme quand la qualité visuelle est la priorité.

---

## 2. Améliorer / retravailler un site existant

| Situation | Skill à utiliser |
|-----------|-----------------|
| Design générique, plat, daté | `/redesign-skill` |
| Animations et transitions bancales | `/emil-design-eng` |
| Site fonctionnel mais visuellement fade | `/redesign-skill` + `/soft-skill` |
| Refonte complète avec nouveau style | `/redesign-skill` + skill de style choisi |

**`/redesign-skill`** — Audite d'abord (typographie, couleurs, espacements, états interactifs, animations), puis améliore **sans réécrire** le code existant. Compatible avec tous les stacks CSS (Tailwind, vanilla, styled-components, CSS modules).

**`/emil-design-eng`** — Focalisé sur les micro-détails : durées d'animation, easing curves, transform-origin, spring physics. Produit des tableaux Before/After avec le raisonnement derrière chaque fix. Idéal pour des questions précises sur le comportement des composants.

---

## 3. Choisir une esthétique visuelle

Ces skills définissent un vocabulaire visuel. Ils se combinent avec les builders ci-dessus.

| Style voulu | Skill |
|-------------|-------|
| Luxe, premium, agence $150k, Apple/Linear-tier | `/soft-skill` |
| Épuré, éditorial, monochrome, beaucoup d'espace | `/minimalist-skill` |
| Brut, industriel, Swiss type + terminal militaire | `/brutalist-skill` |

**Règles communes à tous les skills de style :**
- Bannissent les polices Inter, Roboto, Arial, Open Sans
- Bannissent les ombres génériques (`shadow-md`)
- Bannissent les icônes Lucide épaisses standard
- Bannissent les transitions `ease-in-out` ou `linear` basiques
- Imposent des font pairings premium et des easing curves custom

**`/soft-skill`** — Animations cinématiques, profondeur haptique, micro-interactions obsessionnelles. Jamais deux layouts identiques. Standard Awwwards.

**`/minimalist-skill`** — Pas de gradients, pas d'ombres lourdes, pas de glassmorphism. Palette warm monochrome, bento grids plats, typographie comme seul élément expressif.

**`/brutalist-skill`** — Deux modes exclusifs (Swiss Industrial Print ou Tactical Telemetry/CRT). Grilles rigides, contraste typographique extrême, dégradations analogiques simulées (scanlines, halftones). Pour dashboards data-heavy ou portfolios atypiques.

---

## 4. Présentations et slides

| Situation | Skill |
|-----------|-------|
| Créer une présentation HTML | `/slides` |
| Définir des tokens pour slides cohérentes | `/design-system` |

**`/slides`** — Génère des présentations en HTML + Chart.js. Inclut des formules de copywriting, layouts stratégiques, et stratégies par type de slide (pitch deck, rapport, one-pager). Pas de PowerPoint — rendu dans le navigateur.

---

## 5. Infrastructure design / système

| Situation | Skill |
|-----------|-------|
| Créer un design token system | `/design-system` |
| Définir l'identité de marque | `/brand` |
| Travailler avec Google Stitch | `/stitch-skill` |
| Code généré incomplet (troncature) | `/output-skill` |

**`/design-system`** — Architecture 3 couches (primitive → semantic → component), CSS variables, échelles de spacing/typographie. À utiliser en amont pour structurer un projet avant de coder les composants.

---

## Compatibilité langages / stacks

| Skill | React | Next.js | Vue | Svelte | HTML/CSS | Flutter | Swift | Python |
|-------|-------|---------|-----|--------|----------|---------|-------|--------|
| `taste-skill` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `ui-styling` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `ui-ux-pro-max` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `impeccable` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `redesign-skill` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `emil-design-eng` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `soft/minimalist/brutalist` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

> **Python** : aucun skill UI/UX n'est adapté au Python. Pour Streamlit, Dash ou Django templates, utiliser `/redesign-skill` sur le CSS généré reste possible mais limité.

---

## Combinaisons recommandées

```
Nouveau site React, style premium
→ /taste-skill + /soft-skill

Nouveau site multi-stack, style libre
→ /ui-ux-pro-max

Nouveau site shadcn/ui
→ /ui-styling + /minimalist-skill ou /soft-skill

Site de haute qualité, stack libre
→ /impeccable craft

Amélioration d'un site existant
→ /redesign-skill (+ skill de style si refonte esthétique)

Corrections d'animations
→ /emil-design-eng

Présentation
→ /slides

Design system + tokens
→ /design-system
```
