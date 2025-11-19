(() => {
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

  const events = [
    {
      title: "Complete AAMC #1 under test-like conditions",
      day: "Saturday",
      start: "08:00",
      end: "15:30",
      type: "homework",
      description: "Full-length diagnostic; simulate testing conditions start to finish."
    },
    {
      title: "Asynchronous guided FLE Review Assignment for the CP section",
      day: "Saturday",
      start: "18:00",
      end: "19:30",
      type: "homework",
      description: "Debrief quantitative reasoning with structured prompts."
    },
    {
      title: "Asynchronous guided FLE Review Assignment for the CARS section",
      day: "Sunday",
      start: "14:00",
      end: "15:30",
      type: "homework",
      description: "Narrate strategy choices for each passage and question stem."
    },
    {
      title: "Asynchronous guided FLE Review Assignment for the BB section",
      day: "Sunday",
      start: "16:00",
      end: "17:30",
      type: "homework",
      description: "Focus on experimental reasoning and figure interpretation."
    },
    {
      title: "Asynchronous guided FLE Review Assignment for the PS section",
      day: "Sunday",
      start: "18:00",
      end: "19:30",
      type: "homework",
      description: "Target physics and chem pathways that surfaced during the exam."
    },
    {
      title: "CP Section Dissection",
      day: "Monday",
      start: "10:00",
      end: "11:30",
      type: "live",
      description: "Instructor-led walk-through of core quantitative passages."
    },
    {
      title: "CARS Section Dissection",
      day: "Monday",
      start: "12:00",
      end: "13:30",
      type: "live",
      description: "Demystify reasoning levels and pacing for dense humanities texts."
    },
    {
      title: "BB Section Dissection",
      day: "Monday",
      start: "16:00",
      end: "17:30",
      type: "live",
      description: "Anchor biochemical pathways to recurring MCAT scenarios."
    },
    {
      title: "PS Section Dissection",
      day: "Monday",
      start: "18:00",
      end: "19:30",
      type: "live",
      description: "Reinforce physics + chemistry heuristics for multi-step problems."
    },
    {
      title: "1SM Long Form FLE Post-Mortem Assignment",
      day: "Monday",
      start: "19:45",
      end: "20:30",
      type: "homework",
      description: "Document key takeaways, blind spots, and action commitments."
    },
    {
      title: "Personalized CP Assignment from AAMC / UWorld material",
      day: "Tuesday",
      start: "08:00",
      end: "09:30",
      type: "homework",
      description: "Curated practice set mapped to your diagnostic data."
    },
    {
      title: "Physics Principles & Strategies (part 1)",
      day: "Tuesday",
      start: "10:00",
      end: "11:30",
      type: "live",
      description: "Revisit foundations that unlock mechanics + fluids stems."
    },
    {
      title: "General Chemistry Principles & Strategies (part 1)",
      day: "Tuesday",
      start: "12:00",
      end: "13:30",
      type: "live",
      description: "Pattern-match prompt cues with the right equation families."
    },
    {
      title: "Organic Chemistry Principles & Strategies (part 1)",
      day: "Tuesday",
      start: "16:00",
      end: "17:30",
      type: "live",
      description: "Apply mechanistic thinking to lab technique passages."
    },
    {
      title: "Integrated Physical Science Challenge #1",
      day: "Tuesday",
      start: "18:00",
      end: "19:30",
      type: "live",
      description: "Team-based scenario that weaves physics, gen chem, and orgo."
    },
    {
      title: "1SM Scientific Materials & Methods Long From Assignment #1",
      day: "Tuesday",
      start: "19:45",
      end: "20:30",
      type: "homework",
      description: "Template-driven reflection on lab passages and figure logic."
    },
    {
      title: "AAMC CP Section bank + UWorld, Class Challenge #1 of 3",
      day: "Wednesday",
      start: "08:00",
      end: "09:30",
      type: "homework",
      description: "Timed block to reinforce quantitative reasoning stamina."
    },
    {
      title: "CP Challenge #1 of 3 Post-Mortem Assignment",
      day: "Wednesday",
      start: "10:00",
      end: "12:00",
      type: "homework",
      description: "Translate misses into concrete content and strategy goals."
    },
    {
      title: "1SM CARS Bootcamp Curriculum Lecture #1 of 4",
      day: "Wednesday",
      start: "14:00",
      end: "16:00",
      type: "live",
      description: "Dive into annotation-lite approaches and tone tracking."
    },
    {
      title: "AAMC CARS Q-pack Sprint #1",
      day: "Wednesday",
      start: "17:00",
      end: "17:45",
      type: "homework",
      description: "Targeted sprint on pacing and main idea synthesis."
    },
    {
      title: "AAMC CARS Q-pack Sprint #2",
      day: "Wednesday",
      start: "18:00",
      end: "18:45",
      type: "homework",
      description: "Second sprint to reinforce inference tracking."
    },
    {
      title: "Personalized BB Assignment from AAMC / UWorld material",
      day: "Thursday",
      start: "08:00",
      end: "09:30",
      type: "homework",
      description: "High-yield biology and biochem review drills."
    },
    {
      title: "Experimental Design Theory & Strategies (part 1)",
      day: "Thursday",
      start: "10:00",
      end: "11:30",
      type: "live",
      description: "Strengthen figure-parsing and variable tracing muscles."
    },
    {
      title: "Building Biochemistry (part 1)",
      day: "Thursday",
      start: "12:00",
      end: "13:30",
      type: "live",
      description: "Map enzyme regulation stories to MCAT passage cues."
    },
    {
      title: "Building Biology (part 1)",
      day: "Thursday",
      start: "16:00",
      end: "17:30",
      type: "live",
      description: "Push beyond memorization with systems-level reasoning."
    },
    {
      title: "Integrated Biological Science Experiment Challenge #1",
      day: "Thursday",
      start: "18:00",
      end: "19:30",
      type: "live",
      description: "Collaborative lab-analysis challenge with cold data."
    },
    {
      title: "1SM Scientific Materials & Methods Long From Assignment #2",
      day: "Thursday",
      start: "19:45",
      end: "20:30",
      type: "homework",
      description: "Narrate how evidence quality shapes conclusions."
    },
    {
      title: "AAMC BB Section bank + UWorld, Class Challenge #1 of 3",
      day: "Friday",
      start: "08:00",
      end: "09:30",
      type: "homework",
      description: "Evaluate experimental passages with metabolic twists."
    },
    {
      title: "BB Challenge #1 of 3 Post-Mortem Assignment",
      day: "Friday",
      start: "10:00",
      end: "12:00",
      type: "homework",
      description: "Connect challenge data to your spaced repetition plan."
    },
    {
      title: "1SM Psychology & Sociology Focus Session #1 of 4",
      day: "Friday",
      start: "14:00",
      end: "16:00",
      type: "live",
      description: "Clarify research methods + key theorists for the P/S section."
    },
    {
      title: "1-on-1 Personalized Tutor Check-In Session",
      day: "Friday",
      start: "16:30",
      end: "17:30",
      type: "live",
      description: "Lock in personalized targets for the next study sprint."
    },
    {
      title: "Personalized BB Assignment from AAMC / UWorld material",
      day: "Friday",
      start: "18:00",
      end: "19:30",
      type: "homework",
      description: "Independent practice to apply the week’s live instruction."
    }
  ];

  const timeAxisEl = document.getElementById("timeAxis");
  const dayColumns = Array.from(document.querySelectorAll(".day-column"));
  const dayIndexMap = calendarConfig.days.reduce((map, day, index) => {
    map[day.name] = index;
    return map;
  }, {});

  const details = {
    titleEl: document.getElementById("detailsTitle"),
    timeEl: document.getElementById("detailsTime"),
    descriptionEl: document.getElementById("detailsDescription")
  };

  const defaultDetails = {
    title: "Choose any event",
    time: "Use the schedule to explore the learning arc for each day.",
    description:
      "Filters can hide or show live facilitation and homework sessions. Tap again to collapse the details."
  };

  let activeEventId = null;
  let activeElement = null;
  const renderedEvents = [];

  function init() {
    document.documentElement.style.setProperty(
      "--hour-height",
      `${calendarConfig.hourHeight}px`
    );
    renderTimeAxis();
    renderEvents();
    attachFilterHandlers();
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

    element.className = `calendar-event calendar-event--${event.type}`;
    element.dataset.type = event.type;
    element.dataset.eventId = id;
    element.tabIndex = 0;
    element.setAttribute("role", "button");
    element.setAttribute("aria-label", `${event.title} on ${event.day} from ${formatRange(event.start, event.end)}`);
    element.style.top = `${top}px`;
    element.style.setProperty("--event-height", `${height}px`);

    const timeEl = document.createElement("span");
    timeEl.className = "calendar-event__time";
    timeEl.textContent = formatRange(event.start, event.end);

    const titleEl = document.createElement("h3");
    titleEl.textContent = event.title;

    element.title = event.title;
    element.append(timeEl, titleEl);

    const expand = () => element.classList.add("is-expanded");
    const collapse = () => element.classList.remove("is-expanded");

    element.addEventListener("mouseenter", expand);
    element.addEventListener("mouseleave", collapse);
    element.addEventListener("focus", expand);
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
    }

    element.classList.add("is-active");
    activeElement = element;
    activeEventId = id;
    updateDetails(eventData);
  }

  function resetActiveState() {
    activeEventId = null;
    if (activeElement) {
      activeElement.classList.remove("is-active");
      activeElement = null;
    }
    details.titleEl.textContent = defaultDetails.title;
    details.timeEl.textContent = defaultDetails.time;
    details.descriptionEl.textContent = defaultDetails.description;
  }

  function updateDetails(eventData) {
    details.titleEl.textContent = eventData.title;
    details.timeEl.textContent = `${eventData.day} · ${formatRange(
      eventData.start,
      eventData.end
    )}`;
    details.descriptionEl.textContent = eventData.description;
  }

  function attachFilterHandlers() {
    const filters = {
      live: true,
      homework: true
    };

    const inputs = document.querySelectorAll("input[data-filter]");
    inputs.forEach((input) => {
      input.addEventListener("change", (event) => {
        const type = event.target.dataset.filter;
        filters[type] = event.target.checked;
        updateFilterState(filters);
      });
    });
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

  init();
})();

