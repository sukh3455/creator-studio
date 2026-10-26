import { SceneItem, Language, CharacterAction, CharacterExpression, CharacterPose } from '../types/timeline';
import { ProceduralSynthesizer } from '../engine/proceduralSynthesizer';

export type TopicCategory =
  | 'space'
  | 'solar'
  | 'crypto'
  | 'brain'
  | 'fitness'
  | 'flight'
  | 'quantum'
  | 'biology'
  | 'nature'
  | 'history'
  | 'chemistry'
  | 'cyber'
  | 'finance'
  | 'universal';

export interface DynamicTopic {
  raw: string;
  cleaned: string;
  category: TopicCategory;
  accentColor: string;
}

// Clean and extract core subject from user prompt
export function analyzePrompt(prompt: string): DynamicTopic {
  const raw = prompt.trim();
  const cleaned = ProceduralSynthesizer.cleanTopic(prompt);
  const p = ` ${raw.toLowerCase().replace(/[^a-z0-9]/g, ' ')} `;

  // Word boundary regex matching to avoid substring collision (e.g. 'explain' containing 'ai')
  if (/\b(black hole|space|gravity|galaxy|universe|star|stars|cosmos|astronomy|planet|orbit|spacetime)\b/.test(p)) {
    return { raw, cleaned, category: 'space', accentColor: '#0ea5e9' };
  }
  if (/\b(solar|photovoltaic|photon|photons|clean energy|renewable|sunlight|sun power|solar panel|solar panels)\b/.test(p)) {
    return { raw, cleaned, category: 'solar', accentColor: '#f59e0b' };
  }
  if (/\b(bitcoin|crypto|blockchain|ethereum|token|mining|web3|btc|eth|cryptocurrency)\b/.test(p)) {
    return { raw, cleaned, category: 'crypto', accentColor: '#10b981' };
  }
  if (/\b(brain|mind|psychology|neuro|neuroscience|dopamine|habit|habits|memory|mental|synapse|synaptic)\b/.test(p)) {
    return { raw, cleaned, category: 'brain', accentColor: '#d946ef' };
  }
  if (/\b(gym|muscle|muscles|fitness|workout|exercise|hypertrophy|lifting|barbell|weights|biceps|squat)\b/.test(p)) {
    return { raw, cleaned, category: 'fitness', accentColor: '#ef4444' };
  }
  if (/\b(flight|airplane|airplanes|aircraft|aerodynamic|aerodynamics|airfoil|bernoulli|aviation|propulsion)\b/.test(p)) {
    return { raw, cleaned, category: 'flight', accentColor: '#0284c7' };
  }
  if (/\b(quantum|qubit|qubits|entanglement|schrodinger|superposition|bloch sphere)\b/.test(p)) {
    return { raw, cleaned, category: 'quantum', accentColor: '#6366f1' };
  }
  if (/\b(dna|cell|cells|biology|cellular|genetics|photosynthesis|mitochondria|chlorophyll|enzyme|enzymes)\b/.test(p)) {
    return { raw, cleaned, category: 'biology', accentColor: '#10b981' };
  }
  if (/\b(rain|petrichor|nature|forest|ecology|tree|trees|ecosystem|weather|ocean|dog|dogs|animal|animals|bark)\b/.test(p)) {
    return { raw, cleaned, category: 'nature', accentColor: '#14b8a6' };
  }
  if (/\b(history|empire|empires|rome|roman|war|ancient|sparta|civilization|medieval|gladiator|caesar)\b/.test(p)) {
    return { raw, cleaned, category: 'history', accentColor: '#eab308' };
  }
  if (/\b(chemistry|molecule|molecules|atomic|atom|atoms|chemical|reaction|reactions|benzene|covalent)\b/.test(p)) {
    return { raw, cleaned, category: 'chemistry', accentColor: '#06b6d4' };
  }
  if (/\b(cyber|network|server|servers|internet|packet|packets|algorithm|coding|software|firewall|ai model|deep learning)\b/.test(p)) {
    return { raw, cleaned, category: 'cyber', accentColor: '#22c55e' };
  }
  if (/\b(compound|compounding|wealth|invest|investing|stock|stocks|snowball|dividend|passive income|interest)\b/.test(p)) {
    return { raw, cleaned, category: 'finance', accentColor: '#38bdf8' };
  }

  return { raw, cleaned, category: 'universal', accentColor: '#38bdf8' };
}

interface SceneBlueprint {
  label: string;
  text: string;
  action: CharacterAction;
  expression: CharacterExpression;
  pose: CharacterPose;
}

// Generate unique 4-scene viral script dynamically tailored to ANY concept
export function generateLocalReelScript(prompt: string, language: Language = 'en'): SceneItem[] {
  const topic = analyzePrompt(prompt);
  const subj = topic.cleaned;
  const upperSubj = subj.toUpperCase().slice(0, 18);

  let specs: SceneBlueprint[];

  if (language === 'hi') {
    // Hindi (हिंदी)
    if (topic.category === 'space') {
      specs = [
        { label: `${upperSubj}`, text: `क्या आप जानते हैं कि ${subj} अंतरिक्ष और समय को कैसे मोड़ देता है?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'गुरुत्वाकर्षण खिंचाव', text: `इसके केंद्र में गुरुत्वाकर्षण इतना प्रचंड होता है कि रोशनी भी बाहर नहीं निकल सकती।`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'घटना क्षितिज', text: `इवेंट होराइजन के पार भौतिकी के सारे पुराने नियम पूरी तरह बदल जाते हैं।`, action: 'scale_up', expression: 'surprised', pose: 'thumbs_up' },
        { label: 'ब्रह्मांडीय रहस्य', text: `आज ही ब्रह्मांड के इस अद्भुत विज्ञान को गहराई से समझें!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'finance') {
      specs = [
        { label: `${upperSubj}`, text: `क्या आप जानते हैं कि ${subj} से साधारण बचत भी एक विशाल हिमस्खलन बन जाती है?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'कंपाउंडिंग जादू', text: `जब मुनाफे पर भी मुनाफा जुड़ने लगता है, तो आपकी संपत्ति तेजी से बढ़ती है।`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'घातीय वृद्धि', text: `दुनिया के सबसे अमीर निवेशक इसी चक्रवृद्धि नियम का भरपूर फायदा उठाते हैं।`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'आज ही निवेश करें', text: `देर मत कीजिए, आज ही अपने भविष्य के लिए पहला कदम उठाइए!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'brain') {
      specs = [
        { label: `${upperSubj}`, text: `आपका दिमाग ${subj} पर किस तरह प्रतिक्रिया देता है, क्या आपने सोचा है?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'डोपामाइन लूप', text: `जब यह ट्रिगर होता है, तो न्यूरॉन्स में डोपामाइन की बाढ़ सी आ जाती है।`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'आदत का चक्र', text: `इस न्यूरल सर्किट को समझकर आप अपनी आदतों को पूरी तरह बदल सकते हैं।`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'नियंत्रण पाएं', text: `अपने दिमाग के स्वामी खुद बनिए और हर दिन नया शिखर छुइए!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else {
      specs = [
        { label: `${upperSubj}`, text: `क्या आपने कभी सोचा है कि ${subj} असल में कैसे काम करता है?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'गहरा तंत्र', text: `जब हम ${subj} की गहराई में झांकते हैं, तो एक अद्भुत नियम सामने आता है।`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'असाधारण प्रभाव', text: `यही वह कुंजी है जो साधारण चीजों को बेहद ताकतवर बना देती है।`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'लागू करें', text: `इस नई जानकारी को अपनी दिनचर्या में अपनाएं और असर देखें!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    }
  } else if (language === 'pa') {
    // Punjabi (ਪੰਜਾਬੀ)
    if (topic.category === 'space') {
      specs = [
        { label: `${upperSubj}`, text: `ਕੀ ਤੁਹਾਨੂੰ ਪਤਾ ਹੈ ਕਿ ${subj} ਬ੍ਰਹਿਮੰਡ ਵਿੱਚ ਸਮੇਂ ਅਤੇ ਸਪੇਸ ਨੂੰ ਕਿਵੇਂ ਮੋੜਦਾ ਹੈ?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'ਅਸਲ ਖਿੱਚ', text: `ਇਸਦੇ ਕੇਂਦਰ ਵਿੱਚ ਗੁਰੂਤਾ ਖਿੱਚ ਐਨੀ ਤੇਜ਼ ਹੁੰਦੀ ਹੈ ਕਿ ਰੌਸ਼ਨੀ ਵੀ ਬਾਹਰ ਨਹੀਂ ਆ ਸਕਦੀ।`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'ਵੱਡਾ ਰਹੱਸ', text: `ਇਵੈਂਟ ਹੋਰਾਈਜ਼ਨ ਦੇ ਪਾਰ ਭੌਤਿਕ ਵਿਗਿਆਨ ਦੇ ਸਾਰੇ ਨਿਯਮ ਬਦਲ ਜਾਂਦੇ ਹਨ।`, action: 'scale_up', expression: 'surprised', pose: 'thumbs_up' },
        { label: 'ਸਮਝੋ ਸੱਚ', text: `ਅੱਜ ਹੀ ਬ੍ਰਹਿਮੰਡ ਦੇ ਇਸ ਗੂੜ੍ਹੇ ਵਿਗਿਆਨ ਨੂੰ ਚੰਗੀ ਤਰ੍ਹਾਂ ਸਮਝੋ!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'finance') {
      specs = [
        { label: `${upperSubj}`, text: `ਕੀ ਤੁਸੀਂ ਜਾਣਦੇ ਹੋ ਕਿ ${subj} ਨਾਲ ਨਿੱਕੀ ਜਿਹੀ ਬਚਤ ਵੀ ਬਰਫ ਦੇ ਗੋਲੇ ਵਾਂਗ ਵੱਡੀ ਬਣ ਜਾਂਦੀ ਹੈ?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'ਕੰਪਾਊਂਡਿੰਗ ਦਾ ਰਾਜ਼', text: `ਜਦੋਂ ਮੁਨਾਫੇ 'ਤੇ ਮੁਨਾਫਾ ਜੁੜਦਾ ਹੈ, ਤਾਂ ਦੌਲਤ ਆਪਣੇ-ਆਪ ਗੁਣਾ ਹੁੰਦੀ ਜਾਂਦੀ ਹੈ।`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'ਵੱਡਾ ਮੋੜ', text: `ਦੁਨੀਆ ਦੇ ਕਾਮਯਾਬ ਨਿਵੇਸ਼ਕ ਇਸੇ ਨਿਯਮ ਸਦਕਾ ਅਰਬਪਤੀ ਬਣਦੇ ਹਨ।`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'ਹੁਣੇ ਸ਼ੁਰੂ ਕਰੋ', text: `ਅੱਜ ਹੀ ਸ਼ੁਰੂਆਤ ਕਰੋ ਅਤੇ ਆਪਣੀ ਕਮਾਈ ਨੂੰ ਵਧਦੇ ਹੋਏ ਵੇਖੋ!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else {
      specs = [
        { label: `${upperSubj}`, text: `ਕੀ ਤੁਸੀਂ ਕਦੇ ਸੋਚਿਆ ਹੈ ਕਿ ${subj} ਅਸਲ ਵਿੱਚ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'ਅਸਲ ਕਾਰਨ', text: `ਜਦੋਂ ਅਸੀਂ ${subj} ਨੂੰ ਗਹੁ ਨਾਲ ਸਮਝਦੇ ਹਾਂ, ਤਾਂ ਇੱਕ ਬੇਮਿਸਾਲ ਤਾਕਤ ਸਾਹਮਣੇ ਆਉਂਦੀ ਹੈ।`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'ਵੱਡਾ ਨਤੀਜਾ', text: `ਇਹੀ ਉਹ ਨਿਯਮ ਹੈ ਜੋ ਸਫ਼ਲ ਲੋਕਾਂ ਨੂੰ ਦੂਜਿਆਂ ਨਾਲੋਂ ਵੱਖਰਾ ਬਣਾਉਂਦਾ ਹੈ।`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'ਅਪਣਾਓ ਅੱਜ', text: `ਅੱਜ ਹੀ ਇਸ ਨੂੰ ਅਪਣਾਓ ਅਤੇ ਆਪਣੀ ਮੰਜ਼ਿਲ ਵੱਲ ਕਦਮ ਵਧਾਓ!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    }
  } else if (language === 'fr') {
    // French (Français)
    if (topic.category === 'space') {
      specs = [
        { label: `${upperSubj}`, text: `Saviez-vous comment ${subj} déforme l'espace et le temps de façon extrême ?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'FORCE GRAVITATIONNELLE', text: `Au cœur de ce vortex, la gravité est si intense que même la lumière ne peut s'échapper.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'HORIZON DES ÉVÉNEMENTS', text: `Au-delà de cette frontière, toutes les lois classiques de la physique s'effondrent.`, action: 'scale_up', expression: 'surprised', pose: 'thumbs_up' },
        { label: 'EXPLOREZ LE COSMOS', text: `Regardez les étoiles ce soir et contemplez l'immensité de l'univers !`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'finance') {
      specs = [
        { label: `${upperSubj}`, text: `Saviez-vous comment ${subj} transforme de petites économies en une avalanche exponentielle ?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'EFFET BOULE DE NEIGE', text: `Lorsque les intérêts génèrent à leur tour des gains, la croissance devient inarrêtable.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'MULTIPLICATION RAPIDE', text: `C'est exactement ce levier mathématique que les plus grands investisseurs exploitent.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'PASSEZ À L\'ACTION', text: `Commencez dès aujourd'hui et laissez le temps démultiplier vos résultats !`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else {
      specs = [
        { label: `${upperSubj}`, text: `Avez-vous déjà cherché à comprendre ce qui rend ${subj} si fascinant ?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'LE MÉCANISME CLÉ', text: `Quand on analyse les rouages de ${subj}, un principe fondamental se révèle.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'EFFET EXPONENTIEL', text: `C'est précisément ce mécanisme qui produit des résultats hors du commun.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'APPLIQUEZ-LE !', text: `Mettez ce principe en pratique dès aujourd'hui pour transformer votre quotidien !`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    }
  } else {
    // English (Default)
    if (topic.category === 'space') {
      specs = [
        { label: `${upperSubj}`, text: `Did you know that ${subj} literally bends the fabric of spacetime itself?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'RELATIVISTIC VOID', text: `At its singularity, gravitational forces become so extreme that even photons of light cannot escape.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'EVENT HORIZON', text: `Passing this threshold warps time, revealing the extreme boundaries of quantum astrophysics.`, action: 'scale_up', expression: 'surprised', pose: 'thumbs_up' },
        { label: 'LOOK TO THE STARS', text: `Look up at the cosmos tonight and appreciate the breathtaking physics governing our universe!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'solar') {
      specs = [
        { label: `${upperSubj}`, text: `How do silicon cells turn sunlight into instantaneous electricity during ${subj}?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'PHOTON EXCITATION', text: `Incoming photons collide with silicon atoms, knocking electrons free to create a direct current.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'CLEAN ENERGY SURGE', text: `Modern photovoltaic arrays channel billions of free electrons with zero emissions.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'HARNESS THE SUN', text: `The future of civilization runs on pure solar harvesting—embrace renewable power today!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'crypto') {
      specs = [
        { label: `${upperSubj}`, text: `What makes ${subj} completely immune to centralized manipulation and counterparty risk?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'CRYPTOGRAPHIC TRUST', text: `Through decentralized consensus and hash verification, every transaction is permanently secured on-chain.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'MATHEMATICAL CERTAINTY', text: `Proof-of-work replaces human middlemen with immutable cryptographic rules.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'SECURE THE NETWORK', text: `Understand the code behind decentralized sovereignty before the next financial cycle!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'brain') {
      specs = [
        { label: `${upperSubj}`, text: `Your subconscious neural circuits react to ${subj} in ways you rarely consciously notice.`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'DOPAMINE LOOP', text: `Every time this stimulus occurs, dopamine surges across synaptic gaps to reinforce the behavioral habit.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'NEUROPLASTIC SHIFT', text: `By intercepting the loop with mindful awareness, you physically rewire your synaptic connections.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'UPGRADE YOUR MIND', text: `Take conscious control of your attention today and program your mind for peak performance!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'fitness') {
      specs = [
        { label: `${upperSubj}`, text: `What is the actual physiological stimulus that forces your muscles to grow during ${subj}?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'MECHANICAL TENSION', text: `Progressive overload triggers micro-tears in muscle myofibrils, demanding rapid protein synthesis.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'HYPERTROPHY ADAPTATION', text: `Your body rebuilds the tissue thicker and denser to withstand the next increased workload.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'CRUSH YOUR NEXT SET', text: `Track your numbers, push past your comfort zone, and earn the gains every single session!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'flight') {
      specs = [
        { label: `${upperSubj}`, text: `How does an aircraft weighing hundreds of tons float effortlessly through thin air?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'BERNOULLI PRESSURE', text: `Airfoil curvature accelerates air over the top of the wing, creating a powerful low-pressure suction zone.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'AERODYNAMIC LIFT', text: `This differential pressure generates immense upward lift that completely overcomes gravitational pull.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'DEFY GRAVITY', text: `Next time you look at an airplane in the sky, marvel at the pure fluid dynamics at work!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'quantum') {
      specs = [
        { label: `${upperSubj}`, text: `At the subatomic scale, ${subj} shatters every intuition of classical Newtonian physics.`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'SUPERPOSITION WAVE', text: `A quantum qubit exists in simultaneous probability states until observation collapses the wave function.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'ENTANGLED SPEED', text: `Quantum parallelism computes exponentially complex problems in fractions of a second.`, action: 'scale_up', expression: 'surprised', pose: 'thumbs_up' },
        { label: 'THE QUANTUM ERA', text: `The frontier of computation is being rewritten right now—stay curious and explore the science!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'biology') {
      specs = [
        { label: `${upperSubj}`, text: `Inside every living organism, ${subj} operates with staggering biochemical precision.`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'GENETIC ENGINES', text: `DNA helices replicate with near-zero error while mitochondria churn out ATP energy for every cell.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'EVOLUTIONARY DESIGN', text: `Four billion years of natural selection have perfected this microscopic molecular machinery.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'MARVEL AT LIFE', text: `Every breath you take is powered by billions of molecular miracles working together!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'nature') {
      specs = [
        { label: `${upperSubj}`, text: `Why does nature rely on ${subj} as one of its most remarkable evolutionary patterns?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'NATURAL ADAPTATION', text: `From canine vocal signaling to the sweet smell of petrichor, every element serves an ecological purpose.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'BIOSPHERE HARMONY', text: `Organisms interact seamlessly with their environment to maintain dynamic planetary balance.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'PROTECT OUR PLANET', text: `Observe the intricate living world around you and cherish the wisdom of the wild!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'history') {
      specs = [
        { label: `${upperSubj}`, text: `The untold story of ${subj} dramatically shifted the trajectory of world civilizations.`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'PIVOTAL STRATEGY', text: `Behind every empire lay master tacticians, logistics, and sudden technological turning points.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'ENDURING LEGACY', text: `The institutions and laws forged during this era still shape modern culture today.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'LEARN FROM HISTORY', text: `Those who understand history hold the playbook for navigating the modern world!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'chemistry') {
      specs = [
        { label: `${upperSubj}`, text: `What actually happens when covalent electron bonds break and reform during ${subj}?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'MOLECULAR ORBITALS', text: `Electrons shift probability clouds to reach a lower energy state, releasing energetic heat and light.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'REACTION BALANCE', text: `Thermodynamics and stoichiometry dictate the exact transformation of matter.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'ATOMIC MASTERY', text: `Everything around you is shaped by molecular geometry—unravel the elements!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'cyber') {
      specs = [
        { label: `${upperSubj}`, text: `Behind every digital interaction, ${subj} orchestrates billions of packets per millisecond.`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'HIGH-SPEED ROUTING', text: `Distributed networks route encrypted data across optical fibers with microsecond latency.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'SECURE ARCHITECTURE', text: `Robust fault tolerance and defensive algorithms keep the global internet resilient.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'BUILD THE FUTURE', text: `Master the code behind distributed systems and build the next frontier of tech!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else if (topic.category === 'finance') {
      specs = [
        { label: `${upperSubj}`, text: `Have you ever wondered how compounding interest turns modest savings into an avalanche of wealth?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'EXPONENTIAL SNOWBALL', text: `When returns generate their own returns, your capital grows along an exponential curve.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'COMPOUND ACCELERATION', text: `In the later years, the annual interest easily surpasses your lifetime contributions.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'INVEST TODAY', text: `The best day to start compounding was ten years ago. The second best day is right now!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    } else {
      // Universal / Custom Topic fallback
      specs = [
        { label: `${upperSubj}`, text: `Have you ever wondered what makes ${subj} such a fascinating phenomenon?`, action: 'slide_right', expression: 'excited', pose: 'pointing' },
        { label: 'THE CORE PRINCIPLE', text: `When you analyze how ${subj} operates beneath the surface, a brilliant mechanism emerges.`, action: 'bounce', expression: 'explaining', pose: 'explaining' },
        { label: 'EXPONENTIAL IMPACT', text: `Understanding this dynamic reveals why it produces such widespread and lasting results.`, action: 'scale_up', expression: 'cool', pose: 'thumbs_up' },
        { label: 'APPLY IT TODAY', text: `Look at ${subj} with fresh eyes and apply this insight in your everyday life!`, action: 'jump', expression: 'excited', pose: 'cheering' }
      ];
    }
  }

  // Synthesize procedural canvas code tailored to this category & scene
  return specs.map((s, idx) => {
    const visual = ProceduralSynthesizer.synthesizeVisualCode(prompt, idx);
    return {
      text: s.text,
      label: s.label,
      visualCode: visual.code,
      visualTheme: visual.theme,
      action: s.action,
      expression: s.expression,
      pose: s.pose,
      color: topic.accentColor,
      position: 'center'
    };
  });
}
