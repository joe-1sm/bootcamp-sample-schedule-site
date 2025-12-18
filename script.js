(() => {
  // ============================================
  // API CONFIGURATION
  // ============================================
  const API_URL = 'https://bootcamp-calendar-api.onesm.workers.dev';
  
  // Get studentEmail from URL params (Softr injects this)
  const urlParams = new URLSearchParams(window.location.search);
  const studentEmail = urlParams.get('studentEmail');

  const calendarConfig = {
    startHour: 8,
    endHour: 22,
    hourHeight: 60,
    days: [
      { name: "Saturday", iso: "2025-12-13" },
      { name: "Sunday", iso: "2025-12-14" },
      { name: "Monday", iso: "2025-12-15" },
      { name: "Tuesday", iso: "2025-12-16" },
      { name: "Wednesday", iso: "2025-12-17" },
      { name: "Thursday", iso: "2025-12-18" },
      { name: "Friday", iso: "2025-12-19" }
    ]
  };

  const MIN_BLOCK_HEIGHT_FOR_TIME = 56;

  // Events array - will be populated from API or fallback data
  let events = [];

  // Fallback events (used if API fails)
  const fallbackEvents = [
    {
      title: "Complete AAMC #1 under test-like conditions",
      day: "Saturday",
      start: "08:00",
      end: "15:30",
      type: "homework",
      description: "<strong>BEFORE YOUR COURSE STARTS</strong>\nDuring this window, you are expected to complete AAMC Full-Length Exam (FLE) #1 on your own — this is not a live meeting.\n\n<strong>SIMULATE TEST-DAY CONDITIONS</strong>\nUse a quiet, neutral location (library or similar), not your bed or usual study spot. Start at 8:00 AM sharp, follow AAMC timing, and only take the scheduled breaks. Do not pause outside breaks or check notes/Google. Keep your desk clear during sections, and eat a simple packed lunch during the official lunch break — no errands, no quick Target run, no 'just grabbing coffee.'\n\n<strong>NIGHT-BEFORE & MORNING-OF</strong>\nThe night before, get 7–8 hours of sleep, avoid alcohol, and keep review light (equations, amino acids, key facts). The morning of, eat the same style of breakfast you plan for test day and give yourself enough time to start on time. 8:00 AM means 8:00 AM.\n\n<strong>WHY THIS EXAM MATTERS</strong>\nYou might not feel ready, and that’s okay. This score never goes on an application — it exists so we can see your honest starting point and build a realistic study plan. Please don’t pause outside breaks, look up answers, or inflate your score. Accurate data in = better guidance out.\n\nWhen you finish, report your scores under the My Scores section of the student portal so we can track your progress over time."
    },
    {
      title: "Asynchronous guided FLE Review Assignment for the CP section",
      day: "Saturday",
      start: "18:00",
      end: "19:30",
      type: "homework",
      description: "<strong>WHAT TO DO</strong>\nAfter a short break, return to AAMC FLE #1 and review the CP section using the Guided FLE Review outline. Go question by question, filling in the prompts, writing out your reasoning, and noting any questions or confusions that come up.\n\n<strong>WHY THIS MATTERS</strong>\nWorking through this guided outline will make your review far more efficient. It helps you see exactly where your approach to passages and questions went off track and highlights the specific content gaps you need to target in your upcoming content review."
    },
    {
      title: "Asynchronous guided FLE Review Assignment for the CARS section",
      day: "Sunday",
      start: "14:00",
      end: "15:30",
      type: "homework",
      description: "<strong>WHAT TO DO</strong>\nAfter a short break, return to AAMC FLE #1 and review the CARS section using the Asynchronous Review Guide. Work passage by passage, complete each prompt in the guide, and write out your reasoning in clear sentences.\n\n<strong>BLIND REVIEW FOCUS</strong>\nTreat this as a blind review: ignore your original answers at first and challenge yourself to reason your way to the best choice using logical steps. Only after you commit to a new answer should you compare it with your original choice and the correct answer.\n\n<strong>WHY THIS MATTERS</strong>\nThis process makes your review far more efficient, exposes flaws in your reasoning, and shows you which CARS skills and reading habits you need to strengthen moving forward."
    },
    {
      title: "Asynchronous guided FLE Review Assignment for the BB section",
      day: "Sunday",
      start: "16:00",
      end: "17:30",
      type: "homework",
      description: "<strong>WHAT TO DO</strong>\nAfter a short break, return to AAMC FLE #1 and review the Bio/Biochem section using the Asynchronous Review Guide. Go passage by passage, complete each prompt, and write out your reasoning as you work through the questions.\n\n<strong>LAB METHODS FOCUS</strong>\nPay special attention to laboratory methods, but don’t try to memorize every tiny procedural detail. Instead, focus on applying core chemistry and biology concepts to interpret unfamiliar experiments, graphs, and data.\n\n<strong>WHY THIS MATTERS</strong>\nThis style of review trains you to handle novel setups on test day by relying on fundamentals rather than rote memorization, and it reveals where your reasoning or content understanding needs reinforcement."
    },
    {
      title: "Asynchronous guided FLE Review Assignment for the PS section",
      day: "Sunday",
      start: "18:00",
      end: "19:30",
      type: "homework",
      description: "<strong>WHAT TO DO</strong>\nAfter a short break, return to AAMC FLE #1 and review the Psych/Soc (PS) section using the Asynchronous Review Guide. Go passage by passage, complete each prompt, and write out your reasoning clearly as you work through the questions.\n\n<strong>CONCEPT & LOGIC FOCUS</strong>\nNote any unfamiliar principles or terms and think about how they connect to concepts you already know. As you review, combine the logic from your CARS and Bio/Biochem reviews: carefully track stated logic and conclusions, while also evaluating the quality of the experimental design and use of the scientific method.\n\n<strong>WHY THIS MATTERS</strong>\nPsych/Soc questions often blend reasoning and research skills. This style of review trains you to link new ideas to familiar ones, follow arguments carefully, and recognize well- (or poorly-) designed studies, all of which are essential for scoring highly in PS."
    },
    {
      title: "CP Section Dissection",
      day: "Monday",
      start: "10:00",
      end: "11:30",
      type: "live",
      zoomLink: "https://us02web.zoom.us/j/6502482728?pwd=OHJPV3A2bGZ5eE1EZGRFam50eEw2UT09",
      description: "<strong>WHAT TO EXPECT</strong>\nIn this CP section dissection session, we will work through new passages and questions that mirror the logic patterns from some of the most challenging problems you saw over the weekend. You'll practice applying those same problem-solving strategies to fresh scenarios.\n\n<strong>FIRST-PRINCIPLES THINKING</strong>\nWe'll revisit key concepts from the FLE review and introduce a few new ones, showing how they fit together. The focus is on thinking from first principles: using basic chemistry and physics ideas to break down complex, unfamiliar problems.\n\n<strong>QUANTITATIVE STRATEGY</strong>\nWe'll also review CP-specific passage and question approaches that leverage quantitative reasoning to find efficient solutions without reading every word or relying on massive amounts of memorized content. The goal is fast, clear logic—not heroic amounts of brute-force reading."
    },
    {
      title: "CARS Section Dissection",
      day: "Monday",
      start: "12:00",
      end: "13:30",
      type: "live",
      zoomLink: "https://us02web.zoom.us/j/6437848684?pwd=ye6baEWy3YNkArZlyUaI7w8JS6mb9S.1",
      description: "<strong>WHAT TO EXPECT</strong>\nThis CARS section disssection session is the CARS-focused counterpart to the CP session. We'll tackle new passages and questions that echo the logic and difficulty of the most challenging CARS problems from your full-length exam.\n\n<strong>FATIGUE & FOCUS</strong>\nThere's only a short break between CP and CARS, so you'll be practicing CARS while already mentally tired from quantitative work. That's intentional—test day feels like this. We'll work on maintaining focus, pacing, and decision-making even when your brain is a bit fried.\n\n<strong>CARS REASONING PRACTICE</strong>\nWe'll emphasize the same careful, step-by-step reasoning you used in your CARS review: tracking arguments, evaluating evidence, and eliminating choices using logic rather than vibes. The goal is to transfer those skills to new, unfamiliar passages under realistic test-day conditions."
    },
    {
      title: "BB Section Dissection",
      day: "Monday",
      start: "16:00",
      end: "17:30",
      type: "live",
      zoomLink: "https://us02web.zoom.us/j/7445139408?pwd=IBYqVYhX64VClBo2xFBgapaEJHu4ow.1",
      description: "<strong>WHAT TO EXPECT</strong>\nThis Bio/Biochem section dissection session takes place after a longer break in the afternoon, just like the real MCAT. We'll work through some of the most challenging Bio/Biochem-style passages, with an extra focus on how you approach and dissect them.\n\n<strong>EXPERIMENTAL DESIGN & DATA</strong>\nWe'll emphasize experimental design, the scientific method, and data interpretation as the backbone of Bio/Biochem passages. You'll practice identifying hypotheses, controls, variables, and what the data actually support, so you can reason through complicated figures and setups with confidence.\n\n<strong>FIRST-PRINCIPLES BIOLOGY</strong>\nBecause many students are stronger in biology, the test often raises the difficulty by using novel, technical scenarios. We'll lean on basic principles from chemistry and physics and fundamentals like the central dogma to build a first-principles understanding of complex, unfamiliar techniques, rather than trying to memorize every possible method in advance."
    },
    {
      title: "PS Section Dissection",
      day: "Monday",
      start: "18:00",
      end: "19:30",
      type: "live",
      zoomLink: "https://us02web.zoom.us/j/6437848684?pwd=ye6baEWy3YNkArZlyUaI7w8JS6mb9S.1",
      description: "<strong>WHAT TO EXPECT</strong>\nThis Psych/Soc section dissection session comes at the end of the day, after a short break from Bio/Biochem, mirroring how mentally tired you'll feel on the real exam. We'll work through new Psych/Soc-style passages and questions that resemble the difficulty and style of your full-length exam.\n\n<strong>DATA & LOGIC IN PS</strong>\nWe'll focus on interpreting data from psychological and sociological studies, applying clear logical reasoning to understand what the results actually show (and what they don't). You'll practice connecting study designs, variables, and outcomes to core Psych/Soc concepts.\n\n<strong>INTEGRATING YOUR SKILLS</strong>\nPsych/Soc blends skills from CARS and Bio/Biochem: tracking stated logic, drawing sound conclusions, and evaluating the quality of experimental design. This session is about bringing those skills together so you can handle complex, research-based PS questions with confidence at the end of a long test day."
    },
    {
      title: "1SM Long Form FLE Post-Mortem Assignment",
      day: "Monday",
      start: "19:30",
      end: "20:30",
      type: "homework",
      description: "<strong>WHAT TO EXPECT</strong>\nThis is your first 1SM long-form post-mortem assignment. You’ll answer complex, open-ended questions about scenarios and problems from your recent work, explaining your reasoning step by step from a first-principles perspective.\n\n<strong>HOW TO APPROACH IT</strong>\nType out detailed answers. Don’t worry about sounding perfect or being embarrassed—this is about showing your actual thought process so we can see how you think, where you get stuck, and where your knowledge gaps really are.\n\n<strong>WHY THIS MATTERS</strong>\nThese post-mortems help us pinpoint the exact areas to target with future assignments and review. Work in a focused, timed way so you can be thorough and honest, then close the laptop and enjoy the rest of your evening before we pick things up again tomorrow."
    },
    {
      title: "Personalized CP Assignment from AAMC / UWorld material",
      day: "Tuesday",
      start: "08:00",
      end: "09:30",
      type: "homework",
      description: "<strong>WHAT TO EXPECT</strong>\nThis Personalized CP Assignment from AAMC/UWorld is built specifically from your recent performance. You’ll work through a set of hand-selected questions that mirror the passages, question types, and AAMC principles you struggled with on the full-length exam and in yesterday’s post-mortem.\n\n<strong>HOW TO APPROACH IT</strong>\nTreat each question as a chance to apply the strategies you’ve been sharpening: first-principles thinking, quantitative reasoning, and efficient problem-solving. Move deliberately, write out key steps when needed, and pay attention to patterns in where you hesitate or make errors.\n\n<strong>WHY THIS MATTERS</strong>\nThis isn’t random practice—it’s targeted training on your weak spots and a reinforcement of the skills we’ve been building so far. The more honestly and carefully you work through these questions, the faster your CP logic, confidence, and timing will improve for the next full-length exam."
    },
    {
      title: "Physics Principles & Strategies (part 1)",
      day: "Tuesday",
      start: "10:00",
      end: "11:30",
      type: "live",
      zoomLink: "https://us02web.zoom.us/j/9014065036?pwd=Y0x6amdRNUlGb1doSWk5UGkvYjRXUT09",
      description: "<strong>WHAT TO EXPECT</strong>\nPhysics Principles and Strategies Part 1 is the first in a recurring Tuesday series. In this session, we'll focus on core ideas of work, energy, and force—starting with a quick review of the basics and then ramping into more advanced applications.\n\n<strong>CONTENT FOCUS</strong>\nWe'll explore how these fundamentals connect to higher-level topics like electrostatics, nuclear decay, and geometrical optics, as well as lab-based contexts that draw on chemistry and biology. Expect to see these ideas embedded in realistic passages and questions, not just in isolated formulas.\n\n<strong>INTEGRATION & STRATEGY</strong>\nThis meeting is all about content integration and strategy. We'll use many example problems to show how to recognize underlying physics principles, choose efficient solution paths, and apply the approaches you've been practicing to challenging, test-style scenarios."
    },
    {
      title: "General Chemistry Principles & Strategies (part 1)",
      day: "Tuesday",
      start: "12:00",
      end: "13:30",
      type: "live",
      zoomLink: "https://us02web.zoom.us/j/7445139408?pwd=IBYqVYhX64VClBo2xFBgapaEJHu4ow.1",
      description: "<strong>WHAT TO EXPECT</strong>\nAfter a short break, this General Chemistry Principles and Strategies Part 1 session picks up where Physics left off. We'll build on the ideas of work, energy, and force and transition into core Gen Chem concepts.\n\n<strong>CONTENT FOCUS</strong>\nWe'll emphasize thermodynamics and thermochemistry, using gases as the main vehicle for examples and problems. From there, we'll extend those ideas to bigger-picture topics such as equilibrium, solubility, acids and bases, redox reactions, and electrochemistry.\n\n<strong>INTEGRATION & STRATEGY</strong>\nJust like in the Physics session, we'll rely heavily on passages and test-style questions as the vehicle for discussion. The goal is to see how these concepts interact, practice recognizing which principles apply, and refine your strategy for solving Gen Chem questions efficiently under MCAT conditions."
    },
    {
      title: "Organic Chemistry Principles & Strategies (part 1)",
      day: "Tuesday",
      start: "16:00",
      end: "17:30",
      type: "live",
      zoomLink: "https://us02web.zoom.us/j/7445139408?pwd=IBYqVYhX64VClBo2xFBgapaEJHu4ow.1",
      description: "<strong>WHAT TO EXPECT</strong>\nOrganic Chemistry Principles and Strategies Part 1 is the first session in our Tuesday afternoon orgo series. We'll build directly on the physics and general chemistry concepts from earlier in the day and use them as a launchpad into organic chemistry.\n\n<strong>CONTENT FOCUS</strong>\nWe'll focus on molecular and electronic geometry and how charge distribution shapes the behavior of molecules, solutions, and biological systems. From this foundation, we'll connect thermochemistry and equilibrium ideas to core organic patterns.\n\n<strong>MECHANISMS & BIO RELEVANCE</strong>\nYou'll learn to recognize important reaction mechanisms even when they appear inside large, messy, unfamiliar chemistries in passages. We'll use these examples to highlight how deeply chemistry underpins real biological and biochemical systems, setting the stage for more advanced work later in the course."
    },
    {
      title: "Integrated Physical Science Challenge #1",
      day: "Tuesday",
      start: "18:00",
      end: "19:30",
      type: "live",
      zoomLink: "https://us02web.zoom.us/j/7445139408?pwd=IBYqVYhX64VClBo2xFBgapaEJHu4ow.1",
      description: "<strong>WHAT TO EXPECT</strong>\nIntegrated Physical Science Challenge 1 is a capstone-style session for the day. You'll tackle a complex, puzzle-like scenario built from unfamiliar, seemingly unrelated pieces that can only be solved with true first-principles reasoning.\n\n<strong>HOW IT WORKS</strong>\nYou'll need to lean on the scientific method and experimental design: forming hypotheses, identifying variables, and proposing ways to test ideas with incomplete information. You'll collaborate with classmates in short, focused windows, combine your conclusions, and then use them as seeds for deeper application of the physical science concepts covered throughout the day.\n\n<strong>WHY THIS MATTERS</strong>\nThis exercise mimics how MCAT test writers think—working within constraints to create challenging, but solvable, problems. It trains the 'intangible' skills that separate strong scorers from great ones: flexible reasoning, strategic use of limited data, and the ability to leverage your hard-earned knowledge to reach your true potential on test day."
    },
    {
      title: "1SM Scientific Materials & Methods Long Form Assignment #1",
      day: "Tuesday",
      start: "19:30",
      end: "20:30",
      type: "homework",
      description: "<strong>WHAT TO EXPECT</strong>\nIn 1SM Scientific Materials and Methods Long-Form Assignment 1, you’ll answer open-ended questions about how the physical science concepts from today connect to real laboratory techniques and technologies in physics, chemistry, biology, and medicine.\n\n<strong>CONTENT FOCUS</strong>\nYou’ll think through how ideas like electrostatics, circuits, nuclear decay, fluid dynamics, gas expansion, thermochemistry, intermolecular forces, and molecular geometry underlie complex tools and methods used in modern science. The goal is to see these topics not as isolated facts, but as the engines driving real experimental setups.\n\n<strong>HOW TO APPROACH IT</strong>\nWrite in detailed, long-form responses. Explain your reasoning step by step from a first-principles perspective rather than giving short, polished answers. This helps you (and us) see exactly how you’re thinking, where your understanding is strong, and where there are gaps we can target with future assignments and review on a per-student basis."
    },
    {
      title: "AAMC CP Section bank + UWorld, Class Challenge #1 of 3",
      day: "Wednesday",
      start: "08:00",
      end: "09:30",
      type: "homework",
      description: "<strong>WHAT TO EXPECT</strong>\nThis Wednesday morning asynchronous assignment gives you a fresh set of Chemistry and Physics passages and questions drawn from AAMC section banks and select UWorld materials. The goal is to test how well you retained key concepts and strategies from the last two days.\n\n<strong>HOW TO APPROACH IT</strong>\nWork through each passage using the same first-principles thinking, quantitative reasoning, and passage/question approaches you practiced in lecture and post-mortems. Move deliberately, write out key steps when needed, and pay attention to where you feel rusty or uncertain.\n\n<strong>WHY THIS MATTERS</strong>\nThis is a checkpoint on both content and strategy: it shows how much stuck from the deep dive and how effectively you can apply those critical thinking patterns on your own. Your performance here will guide what we emphasize next in your CP preparation."
    },
    {
      title: "CP Challenge #1 of 3 Post-Mortem Assignment",
      day: "Wednesday",
      start: "10:00",
      end: "12:00",
      type: "homework",
      description: "<strong>WHAT TO EXPECT</strong>\nAfter a short break, you will complete a second asynchronous assignment built specifically from your performance in Integrated Physical Science Challenge 1. You will receive a set of questions and tasks hand-selected to reflect the exact mix of strengths and weaknesses you showed in that challenge.\n\n<strong>HOW TO APPROACH IT</strong>\nWork carefully and honestly. Treat each item as a chance to stress-test your thinking in areas where you were either especially strong or noticeably uncertain. Use first-principles reasoning, and do not rush past questions that feel uncomfortable—that discomfort is the point.\n\n<strong>WHY THIS MATTERS</strong>\nBecause the prior challenge was so complex, each student ends up with a unique profile of skills. This assignment is designed to assess and address your specific gaps, so we can refine your strategy and content focus on a truly individual basis."
    },
    {
      title: "1SM CARS Bootcamp Curriculum Lecture #1 of 4",
      day: "Wednesday",
      start: "14:00",
      end: "16:00",
      type: "live",
      zoomLink: "https://us02web.zoom.us/j/6437848684?pwd=ye6baEWy3YNkArZlyUaI7w8JS6mb9S.1",
      description: "<strong>WHAT TO EXPECT</strong>\nWednesday afternoon is fully dedicated to CARS. In this first of four 1SM CARS Bootcamp Curriculum lectures, we’ll lay out core CARS passage strategy in a structured, step-by-step way.\n\n<strong>STRATEGY & APPLICATION</strong>\nWe’ll build directly on the skills and ideas from Monday’s CARS section dissection session, then demonstrate how to apply those strategies to specific passages and questions. You’ll see exactly how to read, annotate (when appropriate), and decision-make under realistic timing.\n\n<strong>PERSONALIZED GUIDANCE</strong>\nBeyond general strategy, we’ll give situation-based feedback and advice tailored to you: what you personally need to focus on, how to implement CARS practice day to day outside of class, and how to adjust your habits so your effort actually turns into score gains."
    },
    {
      title: "AAMC CARS Q-pack Sprint #1",
      day: "Wednesday",
      start: "17:00",
      end: "18:00",
      type: "homework",
      description: "<strong>WHAT TO DO</strong>\nIn this assignment, you’ll work through three sequential passages from the AAMC CARS QPack. Tackle them under realistic timing, just as you would on a full-length exam.\n\n<strong>STRATEGY FOCUS</strong>\nYour goal is to apply the principles from this afternoon’s CARS lecture: active reading, tracking arguments, using clear logical steps to eliminate choices, and avoiding “vibes-based” guessing. Treat each passage as a chance to practice the exact approach we modeled in class.\n\n<strong>REVIEW AFTERWARD</strong>\nAfter you finish, you’ll follow a set of specific review instructions to go back through your answers and notes. This review is where most of the learning happens—be honest about why you chose each answer, what you missed in the passage, and how you can refine your process for next time."
    },
    {
      title: "AAMC CARS Q-pack Sprint #2",
      day: "Wednesday",
      start: "18:30",
      end: "19:30",
      type: "homework",
      description: "<strong>WHAT TO DO</strong>\nAfter a brief break, you’ll complete a second CARS QPack sprint: three more passages selected by the 1SM team to highlight the same strategies and critical thinking patterns from today’s CARS lecture.\n\n<strong>STRATEGY FOCUS</strong>\nWork under realistic timing and apply the full approach we’ve been practicing—active reading, tracking the author’s argument, using clear logic to eliminate choices, and resisting the urge to guess based on vibes or familiarity.\n\n<strong>REVIEW BOTH SPRINTS</strong>\nWhen you finish this sprint, you’ll review your work for <em>both</em> CARS QPack sprints back-to-back. As you go, take notes on your thought process: why you chose each answer, what you noticed (or missed) in the passage, and any recurring habits—good or bad. These reflections will guide how you fine-tune your CARS strategy moving forward."
    },
    {
      title: "Personalized BB Assignment from AAMC / UWorld material",
      day: "Thursday",
      start: "08:00",
      end: "09:30",
      type: "homework",
      description: "<strong>WHAT TO EXPECT</strong>\nThis Personalized BB Assignment from AAMC/UWorld is built specifically from your recent performance. You’ll work through a set of hand-selected Bio/Biochem questions that mirror the passages, question types, and AAMC principles you struggled with on the full-length exam and in yesterday’s post-mortem.\n\n<strong>HOW TO APPROACH IT</strong>\nTreat each question as a chance to apply the strategies you’ve been sharpening: first-principles thinking, careful interpretation of figures and tables, and a strong focus on experimental design and the scientific method. Move deliberately, write out key connections between data and biology, and pay attention to patterns in where you hesitate or make errors.\n\n<strong>WHY THIS MATTERS</strong>\nThis isn’t random practice—it’s targeted training on your weak spots and a reinforcement of the skills we’ve been building so far. The more honestly and carefully you work through these questions, the faster your Bio/Biochem reasoning, confidence, and timing will improve for the next full-length exam."
    },
    {
      title: "Experimental Design Theory & Strategies (part 1)",
      day: "Thursday",
      start: "10:00",
      end: "11:30",
      type: "live",
      description: "<strong>WHAT TO EXPECT</strong>\nExperimental Design Theory and Strategies Part 1 is the first lecture in a recurring Thursday morning series focused on Bio/Biochem. We’ll zoom in on experimental design, data presentation, and the logic behind MCAT-style studies—areas that are especially challenging for students who haven’t spent much time in research.\n\n<strong>CONTENT FOCUS</strong>\nWe’ll begin by revisiting key physical science ideas from Tuesday so they’re fresh in your mind, then use them to frame how we think about experimental techniques, technologies, and procedures. From there, we’ll explore how experiments are built and how data are displayed in passages across genetics, molecular and cellular biology, and physiology.\n\n<strong>WHY THIS MATTERS</strong>\nExperimental design is one of the biggest hurdles in the Bio/Biochem section. By understanding how experiments are structured and why data look the way they do, you’ll be much better equipped to interpret complex figures and passages. This session plants the seeds for deeper work throughout the day and in future Thursday meetings."
    },
    {
      title: "Building Biochemistry (part 1)",
      day: "Thursday",
      start: "12:00",
      end: "13:30",
      type: "live",
      description: "<strong>WHAT TO EXPECT</strong>\nBuilding Biochemistry Part 1 is the first lecture in a recurring Thursday morning series. We’ll start from the organic (and some general) chemistry concepts you saw on Tuesday and use them to build key biochemistry ideas from first principles.\n\n<strong>CONTENT FOCUS</strong>\nWe’ll look at how the sp2-hybridized nature of aldehydes and ketones, together with the favorable geometry of 5- and 6-membered rings, drives ring-closing reactions. You’ll see how nucleophiles like oxygen and nitrogen create heterocyclic structures that form the backbone of carbohydrates and nucleic acids.\n\nFrom there, we’ll explore nucleophilic reactions that generate long polymers, discuss the entropic penalty of building these chains, and examine how biology manipulates reaction quotients to make ΔG favorable even when ΔG° is strongly endergonic.\n\n<strong>BIG PICTURE</strong>\nAll of this connects back to a core requirement for life: defining a selectively permeable membrane, maintaining order inside that boundary, and preserving polymers of nucleotides that encode the instructions for persistence, reproduction, and propagation of living systems. In other words, we’ll show how “messy” organic chemistry turns into the biochemistry that makes life possible."
    },
    {
      title: "Building Biology (part 1)",
      day: "Thursday",
      start: "16:00",
      end: "17:30",
      type: "live",
      description: "<strong>WHAT TO EXPECT</strong>\nBuilding Biology Part 1 is the first lecture in our Thursday afternoon series. We’ll pick up exactly where Building Biochemistry left off and follow the story from “just chemistry” to full biological systems.\n\n<strong>CONTENT FOCUS</strong>\nWe’ll look at how biochemical reactions—organic chemistry scaled up in tightly controlled environments—create conditions that increase the odds a given string of nucleic acids persists into the future. From there, we’ll connect this idea to evolutionary concepts like Hardy–Weinberg equilibrium, heterozygote advantage, endosymbiotic theory, and the roles of microorganisms and viruses.\n\nWe’ll then zoom into molecular and cellular biology, emphasizing processes in reproduction and development that allow larger organisms to propagate. You’ll see how body plans have to solve fundamental problems like limits of diffusion, and how embryological development acts as a real-time “engineering solution” to those constraints.\n\n<strong>BIG PICTURE</strong>\nBy the end of this session, you’ll see how chemistry-driven biochemistry scales into full biological systems and evolutionary patterns, setting the stage for our next Building Biology meeting, where we transition naturally into physiology."
    },
    {
      title: "Integrated Biological Science: Experimental Design Challenge #1",
      day: "Thursday",
      start: "18:00",
      end: "19:30",
      type: "live",
      description: "<strong>WHAT TO EXPECT</strong>\nIntegrated Biological Science: Experimental Design Challenge 1 is the Bio/Biochem counterpart to Tuesday’s Integrated Physical Science Challenge. You’ll tackle an exceptionally complex, passage-based scenario built around layered experiments and dense data, and you’ll be expected to deconstruct it using first-principles reasoning.\n\n<strong>PASSAGES & DESIGN</strong>\nWe’ll focus on the design of intricate biological and biochemical experiments—how they’re structured, what they’re really testing, and how the data connect (or fail to connect) to the researcher’s claims. You’ll use your MCAT-level biology and biochemistry knowledge to analyze these setups, critique them, and propose alternative designs that could yield the same scientific insights.\n\n<strong>HOW IT WORKS</strong>\nYou’ll collaborate briefly with classmates in short, focused windows, then break off to work independently, using your shared conclusions as seeds for deeper scientific reasoning and written output. The challenge is to think like a test-maker and a researcher at the same time.\n\n<strong>WHY THIS MATTERS</strong>\nYour responses will be assessed overnight and used to generate a follow-up assignment the next morning. This exercise sharpens the experimental design and reasoning skills that are absolutely central to high-level performance on the Bio/Biochem section—and to thinking like an actual scientist, not just a test-taker."
    },
    {
      title: "1SM Scientific Materials & Methods Long Form Assignment #2",
      day: "Thursday",
      start: "19:30",
      end: "20:30",
      type: "homework",
      description: "<strong>WHAT TO EXPECT</strong>\nIn 1SM Scientific Materials and Methods Long-Form Assignment 2, you’ll answer open-ended questions about how today’s biology and biochemistry content connects to real experimental techniques and technologies. This builds directly on Assignment 1 and on the experimental design work you did throughout Thursday’s lectures and challenge.\n\n<strong>CONTENT FOCUS</strong>\nYou’ll think through how core ideas from Bio/Biochem—like enzyme activity, gene expression, signaling pathways, transport across membranes, and molecular interactions—show up in real laboratory methods (assays, imaging, sequencing, and other MCAT-style techniques). The goal is to see these topics not as isolated facts, but as the engines behind the experiments you see in passages.\n\n<strong>HOW TO APPROACH IT</strong>\nWrite detailed, long-form responses. Explain your reasoning step by step from a first-principles perspective rather than trying to give short, polished answers. Be honest about what makes sense and what doesn’t. This lets you (and us) see exactly how you’re thinking, where your understanding is strong, and where there are gaps we can target with future assignments and review on an individual basis."
    },
    {
      title: "AAMC BB Section bank + UWorld, Class Challenge #1 of 3",
      day: "Friday",
      start: "08:00",
      end: "09:30",
      type: "homework",
      description: "<strong>WHAT TO EXPECT</strong>\nThis Friday morning asynchronous assignment gives you a fresh set of Bio/Biochem passages and questions drawn from the AAMC Section Bank and select UWorld materials. The goal is to test how well you’ve retained the key Bio/Biochem concepts and strategies from the last two days of lectures and experimental design work.\n\n<strong>HOW TO APPROACH IT</strong>\nWork through each passage using the same first-principles thinking, data interpretation, and passage/question approaches you’ve been practicing: focus on experimental design, figure reading, and connecting biochemical pathways and mechanisms to the data. Move deliberately, write out key connections when needed, and pay attention to where you feel rusty or uncertain.\n\n<strong>WHY THIS MATTERS</strong>\nThis is a checkpoint on both content and strategy: it shows how much stuck from the Bio/Biochem deep dive and how effectively you can apply those critical thinking patterns on your own. Your performance here will guide what we emphasize next in your BB preparation."
    },
    {
      title: "BB Challenge #1 of 3 Post-Mortem Assignment",
      day: "Friday",
      start: "10:00",
      end: "12:00",
      type: "homework",
      description: "<strong>WHAT TO EXPECT</strong>\nAfter a short break, you’ll complete a Bio/Biochem postmortem assignment built specifically from your performance in BB Challenge 1 of 3. You’ll work through a set of targeted questions and prompts that ask you to unpack your reasoning on some of the most revealing passages and items from that challenge.\n\n<strong>HOW TO APPROACH IT</strong>\nWork carefully and honestly. Treat each prompt as a chance to stress-test your thinking in areas where you were either especially strong or noticeably uncertain—experimental design, figure interpretation, pathways, and mechanisms. Use first-principles reasoning, and don’t rush past questions that feel uncomfortable; that discomfort is exactly where the learning happens.\n\n<strong>WHY THIS MATTERS</strong>\nBB Challenge 1 of 3 exposes a unique profile of strengths and weaknesses for each student. This postmortem is designed to assess and address your specific gaps so we can refine your strategy, experimental reasoning, and content focus on a truly individual basis going forward."
    },
    {
      title: "1SM Psychology & Sociology Focus Session #1 of 4",
      day: "Friday",
      start: "14:00",
      end: "16:00",
      type: "live",
      description: "<strong>WHAT TO EXPECT</strong>\nAfter a long break, you’ll dive into a two-hour Psych/Soc lecture focused on applying high-level critical thinking and reasoning skills to commonly tested—and often misunderstood—Psych/Soc concepts and phenomena.\n\n<strong>CONTENT FOCUS</strong>\nWe’ll emphasize interpreting data from psychological and sociological studies, analyzing experimental design and ethics, and using core principles to reason your way to novel conclusions. You’ll see how to move beyond memorizing terms and instead connect theories, variables, and outcomes in a way that actually matches MCAT passages.\n\n<strong>WHY THIS MATTERS</strong>\nThis lecture is intentionally long and is followed immediately by a personalized Psych/Soc assignment from AAMC and UWorld. The goal is to mimic the mental fatigue you’ll feel at the end of your real exam and train you to think clearly, interpret data, and execute your strategy even when you’re tired—that’s where a lot of real score separation happens."
    },
    {
      title: "Personalized PS Assignment from AAMC / UWorld material",
      day: "Friday",
      start: "16:15",
      end: "17:45",
      type: "homework",
      description: "<strong>WHAT TO EXPECT</strong>\nThis Personalized Psych/Soc Assignment from AAMC/UWorld is built specifically from your recent performance. You’ll work through a set of hand-selected Psych/Soc passages and questions that mirror the concepts, question types, and reasoning patterns you struggled with on the full-length exam and in today’s lecture.\n\n<strong>HOW TO APPROACH IT</strong>\nTreat each question as a chance to apply the strategies you’ve been sharpening: careful reading of stems and answer choices, clear logical reasoning, precise use of Psych/Soc terms, and thoughtful evaluation of study design and ethics. Move deliberately, articulate why each choice is right or wrong in your own words, and pay attention to patterns in where you hesitate or overthink.\n\n<strong>WHY THIS MATTERS</strong>\nThis isn’t random practice — it’s targeted training on your weak spots and a reinforcement of the skills we’ve been building all week. Doing this right after a long lecture also trains you to perform at the end of a mentally taxing day, just like you’ll need to on test day. The more honestly and carefully you work through these questions, the faster your Psych/Soc reasoning, confidence, and timing will improve for your next full-length exam."
    },
    {
      title: "1-on-1 Check-In with 1SM Tutor",
      day: "Friday",
      start: "19:00",
      end: "20:00",
      type: "live",
      description: "<strong>WHAT TO EXPECT</strong>\nYour final meeting of the week is a one-on-one check-in with a 1SM tutor. It's scheduled for up to an hour (though it may be shorter) and is dedicated to reviewing your first week: what you've learned, what you've struggled with, and how you're feeling about the pace and structure of the program.\n\n<strong>WHAT YOU'LL TALK ABOUT</strong>\nYou and your tutor will discuss your progress on assignments and exams, ways to adapt your study and testing strategies, and any questions you have about course mechanics or your personal situation. Your tutor may also ask you targeted questions to gauge your understanding of key content, your logic and reasoning process, and your approach to studying.\n\n<strong>HOW TO APPROACH IT</strong>\nCome prepared with questions, concerns, and honest reflections—this is your time. The more transparent you are, the better your tutor can help you refine your plan, choose supplementary resources, and avoid spinning your wheels on low-yield habits.\n\n<strong>WHY THIS MATTERS</strong>\nEvery student has this check-in in Week 1 to make sure they're on track, staying accountable, and keeping up with the workload. Ongoing weekly check-ins are an optional add-on: we designed it this way to keep the program more financially accessible, while still giving students who want extra personalized support the chance to get it."
    }
  ];

  // ============================================
  // API FETCH FUNCTION
  // ============================================
  
  /**
   * Fetch events from the Cloudflare Worker API
   * Falls back to hardcoded events if API fails
   */
  async function fetchEventsFromAPI() {
    try {
      const url = studentEmail 
        ? `${API_URL}/?studentEmail=${encodeURIComponent(studentEmail)}`
        : `${API_URL}/`;
      
      console.log('[Calendar] Fetching events from API...', { studentEmail });
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[Calendar] Received events from API:', data.events?.length || 0);
      
      if (data.events && data.events.length > 0) {
        // Transform API events to match frontend format
        return data.events.map(event => ({
          id: event.id,
          title: event.title,
          day: event.day,
          start: event.start,
          end: event.end,
          type: event.type,
          zoomLink: event.zoomLink || null,
          assignmentLink: event.assignmentLink || null,  // For homework "Get Started" button
          description: event.description || '',
          videoUrl: event.videoUrl || null,
          // Additional data from Airtable
          aamcPassages: event.aamcPassages || [],
          aamcResources: event.aamcResources || [],
          aamcQuestions: event.aamcQuestions || [],
          oneSmPassages: event.oneSmPassages || [],
          oneSmQuestions: event.oneSmQuestions || [],
          oneSmResources: event.oneSmResources || []
        }));
      }
      
      throw new Error('No events returned from API');
    } catch (error) {
      console.warn('[Calendar] API fetch failed, using fallback data:', error.message);
      return fallbackEvents;
    }
  }

  const timeAxisEl = document.getElementById("timeAxis");
  const dayColumns = Array.from(document.querySelectorAll(".day-column"));
  const dayIndexMap = calendarConfig.days.reduce((map, day, index) => {
    map[day.name] = index;
    return map;
  }, {});

  const details = {
    titleEl: document.getElementById("detailsTitle"),
    timeEl: document.getElementById("detailsTime"),
    descriptionEl: document.getElementById("detailsDescription"),
    container: document.getElementById("eventDetails"),
    card: document.querySelector(".details-card"),
    joinBtn: document.getElementById("joinBtn")
  };

  const floatingBtn = document.getElementById("floatingDetailsBtn");

  const defaultDetails = {
    title: "Choose any event",
    time: "",
    description:
      "Use the schedule to explore the learning arc for each day. Filters can hide or show live facilitation and homework sessions."
  };

  let activeEventId = null;
  let activeElement = null;
  const renderedEvents = [];

  // ============================================
  // DAY SWITCHER STATE & LOGIC
  // ============================================
  
  /**
   * Day view state object
   * Manages current view mode, day index, and visibility
   */
  const dayViewState = {
    currentView: 1,              // 1, 3, or 7 days
    currentDayIndex: 0,          // 0-6 (Saturday-Friday)
    visibleDayIndices: [0],      // Array of visible day indices
    isMobile: false,             // Viewport < 1200px
    totalDays: 7,                // Total days in schedule
    savedScrollTop: 0            // Preserve scroll position when switching
  };

  /**
   * DOM element references (cached for performance)
   */
  const dayViewElements = {
    switcher: null,
    navPrev: null,
    navNext: null,
    navCurrent: null,
    viewPills: [],
    calendar: null,
    calendarBody: null,
    dayColumns: [],
    dayLabels: []
  };

  /**
   * Event-to-day-index map (built during renderEvents)
   * Addresses architect's concern about finding event day indices
   */
  const eventToDayIndex = {};

  async function init() {
    document.documentElement.style.setProperty(
      "--hour-height",
      `${calendarConfig.hourHeight}px`
    );
    
    // Show loading state
    const calendarBody = document.querySelector('.calendar-body');
    if (calendarBody) {
      calendarBody.style.opacity = '0.5';
    }
    
    // Fetch events from API (or use fallback)
    events = await fetchEventsFromAPI();
    console.log('[Calendar] Loaded', events.length, 'events');
    
    // Restore opacity
    if (calendarBody) {
      calendarBody.style.opacity = '1';
    }
    
    renderTimeAxis();
    renderEvents();
    attachFilterHandlers();
    attachFloatingButtonHandler();
    initDaySwitcher(); // Initialize day switcher
    resetActiveState();
    
    // Hide "Learn More" button on embedded version
    const isEmbedded = window.self !== window.top;
    if (isEmbedded) {
      const learnMoreBtn = document.getElementById('learnMoreBtn');
      if (learnMoreBtn) {
        learnMoreBtn.style.display = 'none';
      }
    }
  }

  function renderTimeAxis() {
    if (!timeAxisEl) return;
    for (let hour = calendarConfig.startHour; hour <= calendarConfig.endHour; hour++) {
      const slot = document.createElement("div");
      slot.className = "time-slot";
      const label = document.createElement("span");
      label.textContent = formatHour(hour);
      slot.appendChild(label);
      timeAxisEl.appendChild(slot);
    }
  }

  function renderEvents() {
    events.forEach((event) => {
      const columnIdx = dayIndexMap[event.day];
      const column = dayColumns[columnIdx];
      if (!column) return;

      const element = createEventElement(event);
      column.appendChild(element);
      renderedEvents.push({ element, data: event });
      
      // ARCHITECT FIX: Build event-to-day-index map for checkActiveEventVisibility
      const id = `${event.day}-${event.start}`;
      eventToDayIndex[id] = columnIdx;
    });
  }

  function createEventElement(event) {
    const element = document.createElement("article");
    const startMinutes = toMinutes(event.start);
    const endMinutes = toMinutes(event.end);
    const minutesFromStart = startMinutes - calendarConfig.startHour * 60;
    const duration = Math.max(endMinutes - startMinutes, 15);
    const top = (minutesFromStart / 60) * calendarConfig.hourHeight;
    const height = (duration / 60) * calendarConfig.hourHeight;
    const id = `${event.day}-${event.start}`;
    
    // Z-index: later events stack on top (fixes back-to-back event visibility)
    const zIndex = Math.floor(startMinutes / 10);

    element.className = `calendar-event calendar-event--${event.type}`;
    element.style.zIndex = zIndex;
    element.dataset.type = event.type;
    element.dataset.eventId = id;
    element.tabIndex = 0;
    element.setAttribute("role", "button");
    element.setAttribute("aria-label", `${event.title} on ${event.day} from ${formatRange(event.start, event.end)}`);
    element.setAttribute("aria-controls", "eventDetails");
    element.style.top = `${top}px`;
    element.style.setProperty("--event-height", `${height}px`);

    const titleEl = document.createElement("h3");
    titleEl.textContent = event.title;

    const timeEl = document.createElement("span");
    timeEl.className = "calendar-event__time";
    timeEl.textContent = formatRangeCompact(event.start, event.end);

    const hasRoomForTime = height >= MIN_BLOCK_HEIGHT_FOR_TIME;
    element.classList.toggle("is-compact", !hasRoomForTime);

    element.title = event.title;
    element.append(titleEl, timeEl);

    const expand = () => element.classList.add("is-expanded");
    const collapse = () => {
      // Don't auto-collapse if this event is actively selected
      if (activeEventId !== id) {
        element.classList.remove("is-expanded");
      }
    };

    element.addEventListener("mouseenter", () => {
      // Don't auto-expand if another event is actively selected
      if (activeEventId !== id) {
        expand();
      }
    });
    element.addEventListener("mouseleave", collapse);
    element.addEventListener("focus", () => {
      if (activeEventId !== id) {
        expand();
      }
    });
    element.addEventListener("blur", collapse);
    element.addEventListener("click", () => handleEventToggle(event, element, id));
    element.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        handleEventToggle(event, element, id);
      }
    });

    return element;
  }

  function handleEventToggle(eventData, element, id) {
    if (activeEventId === id) {
      resetActiveState();
      return;
    }

    if (activeElement) {
      activeElement.classList.remove("is-active");
      activeElement.classList.remove("is-expanded"); // Clean up previous active element
    }

    element.classList.add("is-active");
    element.classList.add("is-expanded"); // Keep selected event expanded
    activeElement = element;
    activeEventId = id;
    updateDetails(eventData);
  }

  function resetActiveState() {
    if (activeElement) {
      activeElement.classList.remove("is-active");
      activeElement.classList.remove("is-expanded"); // Clean up expansion state
      activeElement = null;
    }
    activeEventId = null;
    details.titleEl.textContent = defaultDetails.title;
    details.timeEl.textContent = defaultDetails.time;
    details.timeEl.classList.add("is-hidden");
    details.timeEl.style.display = "none"; // Force hide with inline style
    details.descriptionEl.textContent = defaultDetails.description;
    
    // Hide join button
    if (details.joinBtn) {
      details.joinBtn.classList.add("is-hidden");
      details.joinBtn.href = "#";
    }
    
    // Hide floating button when no event is selected
    hideFloatingButton();
  }

  function updateDetails(eventData) {
    details.titleEl.textContent = eventData.title;
    details.timeEl.textContent = `${eventData.day} · ${formatRange(
      eventData.start,
      eventData.end
    )}`;
    details.timeEl.classList.remove("is-hidden");
    details.timeEl.style.display = "block"; // Force display with inline style
    details.descriptionEl.innerHTML = eventData.description;
    
    // Show/hide action button based on event type and links
    // Only show on embedded version (inside iframe)
    const isEmbedded = window.self !== window.top;
    console.log('[Calendar] updateDetails button check:', { 
      isEmbedded, 
      zoomLink: eventData.zoomLink, 
      assignmentLink: eventData.assignmentLink,
      title: eventData.title
    });
    if (details.joinBtn) {
      if (eventData.zoomLink && isEmbedded) {
        // Live event with Zoom link
        details.joinBtn.href = eventData.zoomLink;
        details.joinBtn.textContent = "Click to Join";
        details.joinBtn.classList.remove("is-hidden");
      } else if (eventData.assignmentLink && isEmbedded) {
        // Homework event with assignment link
        details.joinBtn.href = eventData.assignmentLink;
        details.joinBtn.textContent = "Get Started";
        details.joinBtn.classList.remove("is-hidden");
      } else {
        details.joinBtn.classList.add("is-hidden");
        details.joinBtn.href = "#";
      }
    }
    
    // Show floating button on mobile
    showFloatingButton();
  }

  function attachFilterHandlers() {
    const filters = {
      live: true,
      homework: true
    };

    const inputs = document.querySelectorAll("input[data-filter]");
    inputs.forEach((input) => syncFilterPillState(input));
    inputs.forEach((input) => {
      input.addEventListener("change", (event) => {
        const type = event.target.dataset.filter;
        filters[type] = event.target.checked;
        syncFilterPillState(event.target);
        updateFilterState(filters);
      });
    });
  }

  function syncFilterPillState(input) {
    const pill = input.closest(".filter-pill");
    if (!pill) return;
    pill.classList.toggle("is-off", !input.checked);
  }

  function updateFilterState(filters) {
    renderedEvents.forEach(({ element, data }) => {
      const isVisible = filters[data.type];
      element.classList.toggle("is-hidden", !isVisible);
      if (!isVisible && element.dataset.eventId === activeEventId) {
        resetActiveState();
      }
    });
  }

  function toMinutes(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function formatHour(hour24) {
    const suffix = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${hour12}:00 ${suffix}`;
  }

  function formatRange(start, end) {
    return `${formatTime(start)} – ${formatTime(end)}`;
  }

  function formatTime(timeString) {
    const [h, m] = timeString.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const minutes = String(m).padStart(2, "0");
    return `${hour12}:${minutes} ${suffix}`;
  }

  function formatTimeCompact(timeString) {
    const [h, m] = timeString.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    // Drop :00 for times on the hour
    if (m === 0) {
      return `${hour12} ${suffix}`;
    }
    const minutes = String(m).padStart(2, "0");
    return `${hour12}:${minutes} ${suffix}`;
  }

  function formatRangeCompact(start, end) {
    const startFormatted = formatTimeCompact(start);
    const endFormatted = formatTimeCompact(end);
    
    // Extract AM/PM from both times
    const startParts = startFormatted.split(" ");
    const endParts = endFormatted.split(" ");
    const startTime = startParts[0];
    const startPeriod = startParts[1];
    const endTime = endParts[0];
    const endPeriod = endParts[1];
    
    // If both have same AM/PM, only show it once at the end
    if (startPeriod === endPeriod) {
      return `${startTime} – ${endTime} ${endPeriod}`;
    }
    
    return `${startTime} ${startPeriod} – ${endTime} ${endPeriod}`;
  }

  function showFloatingButton() {
    if (!floatingBtn) return;
    floatingBtn.setAttribute("aria-hidden", "false");
  }

  function hideFloatingButton() {
    if (!floatingBtn) return;
    floatingBtn.setAttribute("aria-hidden", "true");
  }

  function attachFloatingButtonHandler() {
    if (!floatingBtn) return;
    
    floatingBtn.addEventListener("click", () => {
      if (!details.container) return;
      
      // Smooth scroll to details panel
      details.container.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
      
      // Focus the details card for keyboard users after a short delay
      setTimeout(() => {
        if (details.card) {
          details.card.focus();
        }
      }, 500); // Wait for scroll to mostly complete
      
      // Optional: Hide button after click to reduce clutter
      // Uncomment if you want the button to disappear after use:
      // setTimeout(hideFloatingButton, 600);
    });
  }

  // ============================================
  // DAY SWITCHER IMPLEMENTATION
  // ============================================

  /**
   * Initialize day switcher
   * Called from main init() function
   */
  function initDaySwitcher() {
    // Cache DOM elements
    dayViewElements.switcher = document.getElementById('daySwitcher');
    dayViewElements.navPrev = document.getElementById('dayNavPrev');
    dayViewElements.navNext = document.getElementById('dayNavNext');
    dayViewElements.navCurrent = document.getElementById('dayNavCurrent');
    dayViewElements.viewPills = document.querySelectorAll('.view-toggle__pill');
    dayViewElements.calendar = document.querySelector('.calendar');
    dayViewElements.calendarBody = document.querySelector('.calendar-body');
    dayViewElements.dayColumns = document.querySelectorAll('.day-column');
    dayViewElements.dayLabels = document.querySelectorAll('.calendar-header > .day-label');
    
    // Exit if DOM not ready
    if (!dayViewElements.switcher || !dayViewElements.calendar) {
      console.warn('Day switcher elements not found');
      return;
    }
    
    // Check viewport and set initial state
    checkViewport();
    
    // Attach event handlers
    attachDaySwitcherHandlers();
    
    // Load saved preference (with guards)
    loadViewPreference();
    
    // Initial render - ARCHITECT FIX: Ensure nav display updated after preference load
    updateVisibleDays();
    updateDayNavDisplay();
    updateViewToggleButtons();
  }

  /**
   * Check viewport size and set mobile flag
   * Desktop (≥1200px) always shows 7-day view with side-by-side layout
   * Tablet (768-1199px) shows switcher with all 3 options, defaults to 7-day
   * Mobile (<768px) shows switcher with 1/3-day only, defaults to 1-day
   */
  function checkViewport() {
    const width = window.innerWidth;
    const wasMobile = dayViewState.isMobile;
    const wasView = dayViewState.currentView;
    
    dayViewState.isMobile = width < 1200;
    const isTrueMobile = width < 768;
    
    if (!dayViewState.isMobile) {
      // Desktop: Force 7-day view, hide switcher
      dayViewState.currentView = 7;
      dayViewState.currentDayIndex = 0;
      dayViewState.visibleDayIndices = [0, 1, 2, 3, 4, 5, 6];
      
      if (dayViewElements.calendar) {
        dayViewElements.calendar.classList.remove('day-switcher-active');
      }
    } else {
      // Mobile/Tablet: Enable switcher
      if (dayViewElements.calendar) {
        dayViewElements.calendar.classList.add('day-switcher-active');
      }
      
      // True mobile: If currently in 7-day view, switch to 3-day (since 7-day button is hidden)
      if (isTrueMobile && dayViewState.currentView === 7) {
        dayViewState.currentView = 3;
        // Adjust day index if needed
        const maxIndex = dayViewState.totalDays - dayViewState.currentView;
        if (dayViewState.currentDayIndex > maxIndex) {
          dayViewState.currentDayIndex = Math.max(0, maxIndex);
        }
      }
      
      // On first load without saved preference
      if (!sessionStorage.getItem('bootcamp-calendar-view')) {
        // True mobile: default to 1-day
        if (isTrueMobile && (dayViewState.currentView === 7 || dayViewState.currentView === 3)) {
          dayViewState.currentView = 1;
        }
        // Tablet keeps current view (or 7-day by default)
      }
    }
    
    // If view changed, update the display
    if (wasView !== dayViewState.currentView || wasMobile !== dayViewState.isMobile) {
      updateVisibleDays();
      updateDayNavDisplay();
      updateViewToggleButtons();
    }
  }

  /**
   * Attach all event handlers for day switcher
   */
  function attachDaySwitcherHandlers() {
    // View toggle pills
    dayViewElements.viewPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const view = parseInt(pill.dataset.view, 10);
        handleViewToggle(view);
      });
    });
    
    // Navigation buttons
    if (dayViewElements.navPrev) {
      dayViewElements.navPrev.addEventListener('click', () => {
        if (!dayViewElements.navPrev.disabled) {
          handleDayNavigation('prev');
        }
      });
    }
    
    if (dayViewElements.navNext) {
      dayViewElements.navNext.addEventListener('click', () => {
        if (!dayViewElements.navNext.disabled) {
          handleDayNavigation('next');
        }
      });
    }
    
    // Keyboard navigation (arrow keys)
    document.addEventListener('keydown', (e) => {
      if (!dayViewState.isMobile) return;
      
      // Only handle if not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (!dayViewElements.navPrev.disabled) {
          handleDayNavigation('prev');
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!dayViewElements.navNext.disabled) {
          handleDayNavigation('next');
        }
      }
    });
    
    // Window resize handler (debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const wasMobile = dayViewState.isMobile;
        checkViewport();
        
        // If switched between mobile/desktop
        if (wasMobile !== dayViewState.isMobile) {
          updateVisibleDays();
          updateDayNavDisplay();
          updateViewToggleButtons();
        }
      }, 250);
    });
  }

  /**
   * Handle view toggle button click
   * @param {number} viewCount - 1, 3, or 7 (true mobile <768px only supports 1 and 3)
   */
  function handleViewToggle(viewCount) {
    if (!dayViewState.isMobile) return;
    
    // True mobile (<768px) only supports 1 and 3-day views, tablet allows 7-day too
    const isTrueMobile = window.innerWidth < 768;
    if (isTrueMobile && viewCount !== 1 && viewCount !== 3) return;
    
    // Save scroll position
    if (dayViewElements.calendarBody) {
      dayViewState.savedScrollTop = dayViewElements.calendarBody.scrollTop;
    }
    
    // Update state
    dayViewState.currentView = viewCount;
    
    // Adjust currentDayIndex if it would overflow
    const maxIndex = dayViewState.totalDays - viewCount;
    if (dayViewState.currentDayIndex > maxIndex) {
      dayViewState.currentDayIndex = Math.max(0, maxIndex);
    }
    
    // Save preference
    saveViewPreference(viewCount);
    
    // Update UI
    updateVisibleDays();
    updateDayNavDisplay();
    updateViewToggleButtons();
    
    // Restore scroll position after render
    requestAnimationFrame(() => {
      if (dayViewElements.calendarBody) {
        dayViewElements.calendarBody.scrollTop = dayViewState.savedScrollTop;
      }
    });
    
    // Check if active event is now hidden
    checkActiveEventVisibility();
  }

  /**
   * Handle navigation arrow click
   * @param {string} direction - 'prev' or 'next'
   */
  function handleDayNavigation(direction) {
    if (!dayViewState.isMobile) return;
    
    // Save scroll position
    if (dayViewElements.calendarBody) {
      dayViewState.savedScrollTop = dayViewElements.calendarBody.scrollTop;
    }
    
    // Always move by 1 day, regardless of current view
    const step = 1;
    
    if (direction === 'prev') {
      // Move backwards by 1 day, don't go below 0
      dayViewState.currentDayIndex = Math.max(0, dayViewState.currentDayIndex - step);
    } else {
      // Move forwards by 1 day, respect week boundary
      const maxIndex = dayViewState.totalDays - dayViewState.currentView;
      dayViewState.currentDayIndex = Math.min(maxIndex, dayViewState.currentDayIndex + step);
    }
    
    // Update UI
    updateVisibleDays();
    updateDayNavDisplay();
    
    // Restore scroll position after render
    requestAnimationFrame(() => {
      if (dayViewElements.calendarBody) {
        dayViewElements.calendarBody.scrollTop = dayViewState.savedScrollTop;
      }
    });
    
    // Check if active event is now hidden
    checkActiveEventVisibility();
  }

  /**
   * Update which day columns are visible based on state
   */
  function updateVisibleDays() {
    if (!dayViewState.isMobile) {
      // Desktop: Show all days
      showAllDays();
      return;
    }
    
    const { currentView, currentDayIndex } = dayViewState;
    
    // Calculate visible day indices
    const visibleIndices = [];
    for (let i = 0; i < currentView; i++) {
      const index = currentDayIndex + i;
      if (index < dayViewState.totalDays) {
        visibleIndices.push(index);
      }
    }
    
    dayViewState.visibleDayIndices = visibleIndices;
    
    // Update DOM
    updateCalendarColumns();
    updateCalendarHeaders();
    updateCalendarViewClass();
  }

  /**
   * Show/hide appropriate day columns
   */
  function updateCalendarColumns() {
    dayViewElements.dayColumns.forEach((column, index) => {
      const isVisible = dayViewState.visibleDayIndices.includes(index);
      column.classList.toggle('day-column--visible', isVisible);
    });
  }

  /**
   * Show/hide appropriate day headers
   */
  function updateCalendarHeaders() {
    dayViewElements.dayLabels.forEach((label, index) => {
      const isVisible = dayViewState.visibleDayIndices.includes(index);
      label.classList.toggle('day-label--visible', isVisible);
    });
  }

  /**
   * Update calendar class for CSS targeting
   */
  function updateCalendarViewClass() {
    const calendar = dayViewElements.calendar;
    if (!calendar) return;
    
    // Remove old view classes
    calendar.classList.remove('view-1-day', 'view-3-day', 'view-7-day');
    
    // Add current view class
    calendar.classList.add(`view-${dayViewState.currentView}-day`);
  }

  /**
   * Show all days (desktop mode)
   */
  function showAllDays() {
    dayViewElements.dayColumns.forEach(column => {
      column.classList.add('day-column--visible');
    });
    
    dayViewElements.dayLabels.forEach(label => {
      label.classList.add('day-label--visible');
    });
    
    if (dayViewElements.calendar) {
      dayViewElements.calendar.classList.remove('view-1-day', 'view-3-day', 'view-7-day');
    }
  }

  /**
   * Update day navigation display text
   * Shows current date range
   */
  function updateDayNavDisplay() {
    if (!dayViewElements.navCurrent) return;
    
    const { currentView, currentDayIndex } = dayViewState;
    const startDay = calendarConfig.days[currentDayIndex];
    
    if (!startDay) return;
    
    let displayText = '';
    
    if (currentView === 1) {
      // "Saturday, Dec 13"
      displayText = `${startDay.name}, ${formatDateShort(startDay.iso)}`;
    } else if (currentView === 3) {
      // "Sat (12/13) - Tues (12/15)" format
      const endIndex = Math.min(currentDayIndex + 2, dayViewState.totalDays - 1);
      const endDay = calendarConfig.days[endIndex];
      const startAbbrev = getDayAbbreviation(startDay.name);
      const endAbbrev = getDayAbbreviation(endDay.name);
      displayText = `${startAbbrev} (${formatDateMD(startDay.iso)}) - ${endAbbrev} (${formatDateMD(endDay.iso)})`;
    } else if (currentView === 7) {
      // "Dec 13 – 19" for full week view
      displayText = "Dec 13 – 19";
    }
    
    dayViewElements.navCurrent.textContent = displayText;
    
    // Update navigation button states
    updateNavigationButtons();
  }

  /**
   * Enable/disable navigation buttons based on boundaries
   * No wrapping allowed - stop at week edges
   */
  function updateNavigationButtons() {
    if (!dayViewElements.navPrev || !dayViewElements.navNext) return;
    
    const { currentDayIndex, currentView, totalDays } = dayViewState;
    
    // Disable prev if at start
    const atStart = currentDayIndex === 0;
    dayViewElements.navPrev.disabled = atStart;
    dayViewElements.navPrev.setAttribute('aria-disabled', atStart ? 'true' : 'false');
    
    // Disable next if at or beyond end
    const atEnd = currentDayIndex + currentView >= totalDays;
    dayViewElements.navNext.disabled = atEnd;
    dayViewElements.navNext.setAttribute('aria-disabled', atEnd ? 'true' : 'false');
  }

  /**
   * Update view toggle button active states
   */
  function updateViewToggleButtons() {
    dayViewElements.viewPills.forEach(pill => {
      const view = parseInt(pill.dataset.view, 10);
      const isActive = view === dayViewState.currentView;
      
      pill.classList.toggle('view-toggle__pill--active', isActive);
      pill.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
  }

  /**
   * Check if currently selected event is still visible
   * Reset details panel if it's hidden
   * ARCHITECT FIX: Uses eventToDayIndex map instead of searching calendarConfig.days
   */
  function checkActiveEventVisibility() {
    if (!activeEventId) return;
    
    // Find which day the active event is on using the map
    const activeEventDayIndex = eventToDayIndex[activeEventId];
    
    if (activeEventDayIndex === undefined) return;
    
    // Check if that day is still visible
    const isVisible = dayViewState.visibleDayIndices.includes(activeEventDayIndex);
    
    if (!isVisible) {
      // Active event is now hidden, reset details panel
      resetActiveState();
    }
  }

  /**
   * Format date for display (e.g., "Dec 13")
   * @param {string} isoDate - ISO date string (YYYY-MM-DD)
   * @returns {string}
   */
  function formatDateShort(isoDate) {
    // Parse ISO date directly to avoid timezone issues
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    return `${monthName} ${day}`;
  }

  /**
   * Get day number from ISO date (timezone-safe)
   * @param {string} isoDate - ISO date string (YYYY-MM-DD)
   * @returns {number}
   */
  function getDayNumber(isoDate) {
    // Parse directly from string to avoid timezone conversion issues
    const [year, month, day] = isoDate.split('-').map(Number);
    return day;
  }

  /**
   * Format date as M/D (e.g., "12/13")
   * @param {string} isoDate - ISO date string (YYYY-MM-DD)
   * @returns {string}
   */
  function formatDateMD(isoDate) {
    const [year, month, day] = isoDate.split('-').map(Number);
    return `${month}/${day}`;
  }

  /**
   * Get day abbreviation
   * @param {string} dayName - Full day name
   * @returns {string} Abbreviated day name
   */
  function getDayAbbreviation(dayName) {
    const abbreviations = {
      'Saturday': 'Sat',
      'Sunday': 'Sun',
      'Monday': 'Mon',
      'Tuesday': 'Tues',
      'Wednesday': 'Wed',
      'Thursday': 'Thurs',
      'Friday': 'Fri'
    };
    return abbreviations[dayName] || dayName;
  }

  /**
   * Save view preference to sessionStorage
   * @param {number} view
   */
  function saveViewPreference(view) {
    try {
      sessionStorage.setItem('bootcamp-calendar-view', view.toString());
    } catch (e) {
      console.warn('Failed to save view preference:', e);
    }
  }

  /**
   * Load view preference from sessionStorage
   * Includes guard against stale/invalid values
   * ARCHITECT FIX: Ensures nav display is updated after clamping
   */
  function loadViewPreference() {
    if (!dayViewState.isMobile) return;
    
    const isTrueMobile = window.innerWidth < 768;
    
    try {
      const saved = sessionStorage.getItem('bootcamp-calendar-view');
      if (saved) {
        let view = parseInt(saved, 10);
        
        // Guard: Clamp to valid range
        if (view < 1) view = 1;
        
        if (isTrueMobile) {
          // True mobile: Only 1 and 3 are valid
          if (view > 3) view = 3;
          if (view === 2) view = 1;
        } else {
          // Tablet: 1, 3, and 7 are all valid
          if (view > 7) view = 7;
          if (view === 2) view = 1;
          if (view > 3 && view < 7) view = 3; // Clamp 4,5,6 to 3
        }
        
        // Guard: If saved view would overflow, reduce it
        const remainingDays = dayViewState.totalDays - dayViewState.currentDayIndex;
        if (view > remainingDays) {
          if (isTrueMobile) {
            view = Math.min(3, remainingDays);
            if (view === 2) view = 1;
          } else {
            view = Math.min(7, remainingDays);
          }
        }
        
        dayViewState.currentView = view;
      }
    } catch (e) {
      console.warn('Failed to load view preference:', e);
    }
  }

  init();

})();

