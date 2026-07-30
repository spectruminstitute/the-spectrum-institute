        // Google Apps Script Web App — student roster sheet sync (fire-and-forget)
        const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwkKnzDZdOk1tHps0LZ0HDSWAqaQXW5yGIayHlmqfjou_lNSJT2fcYDL7VkFX0Q8oWfpg/exec";
        const NO_COURSE_YET_VALUE = "__none__";
        const NO_COURSE_YET_LABEL = "No course yet";

        function setCertificatePreviewLoading(isLoading) {
            const frame = document.getElementById('certPreviewFrame');
            const skeleton = document.getElementById('certPreviewSkeleton');
            const stage = document.getElementById('certOverlayStage');
            const placeholder = document.getElementById('certPreviewPlaceholder');
            if (frame) frame.classList.toggle('is-loading', isLoading);
            if (skeleton) {
                skeleton.hidden = !isLoading;
                skeleton.setAttribute('aria-hidden', isLoading ? 'false' : 'true');
            }
            if (isLoading) {
                if (stage) stage.hidden = true;
                if (placeholder) placeholder.hidden = true;
            }
        }

        // Real-Time Predictive Course Filter Logic
        function realTimeFilter() {
            const searchInput = document.getElementById('courseSearch');
            const grid = document.getElementById('coursesGrid');
            if (!searchInput || !grid) return;
            const input = searchInput.value.toLowerCase();
            const cards = grid.getElementsByClassName('category-card');
            let globalMatches = 0;

            // Remove existing clean slate error flag block if any
            const existingError = document.getElementById('searchEmptyStateBlock');
            if(existingError) existingError.remove();

            for (let i = 0; i < cards.length; i++) {
                const listItems = cards[i].getElementsByTagName('li');
                let cardHasMatch = false;

                for (let j = 0; j < listItems.length; j++) {
                    const textValue = listItems[j].textContent || listItems[j].innerText;
                    if (textValue.toLowerCase().indexOf(input) > -1) {
                        listItems[j].classList.remove('hide-item');
                        if (input !== "") {
                            listItems[j].classList.add('highlight-match');
                        } else {
                            listItems[j].classList.remove('highlight-match');
                        }
                        cardHasMatch = true;
                        globalMatches++;
                    } else {
                        listItems[j].classList.add('hide-item');
                        listItems[j].classList.remove('highlight-match');
                    }
                }

                if (cardHasMatch) {
                    cards[i].classList.remove('hide-card');
                } else {
                    cards[i].classList.add('hide-card');
                }
            }

            if(globalMatches === 0) {
                const errorBlock = document.createElement('div');
                errorBlock.id = "searchEmptyStateBlock";
                errorBlock.className = "no-results";
                errorBlock.innerHTML = `❌ No courses matching "<strong>${input}</strong>" found. Try checking safety or engineering tracks.`;
                grid.appendChild(errorBlock);
            }
        }

        // Live input metrics fields validations helper
        function validateInputLive(inputElement) {
            if(inputElement.type === "email") {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(inputElement.value === "" || re.test(inputElement.value)) {
                    inputElement.classList.remove('input-invalid');
                    inputElement.classList.add('input-valid');
                } else {
                    inputElement.classList.remove('input-valid');
                    inputElement.classList.add('input-invalid');
                }
                return;
            }
            if(inputElement.value.trim().length >= 3) {
                inputElement.classList.remove('input-invalid');
                inputElement.classList.add('input-valid');
            } else {
                inputElement.classList.remove('input-valid');
                inputElement.classList.add('input-invalid');
            }
        }

        // Interactive Course Modal Popup Database and Logic
        const courseDatabase = {
            'Iosh Osha': {
                syllabus: 'Introduction to health & safety, risk assessments, controlling common hazards, identifying responsibilities, and investigating accidents or incidents.',
                career: 'Safety Inspector, Assistant Safety Officer, Site Safety Coordinator in construction and manufacturing industries.'
            },
            'Nebosh IGC': {
                syllabus: 'International management of health and safety, risk assessment matrices, workplace hazard control, transport safety, musculoskeletal hazards, and electrical safety.',
                career: 'HSE Officer, Safety Engineer, Health & Safety Manager across Gulf countries, Europe, and multinational firms.'
            },
            'Fire Safety': {
                syllabus: 'Chemistry of fire, classification of fires, fire extinguisher practical training, evacuation route mapping, and emergency response leadership strategies.',
                career: 'Fire Warden, Fire Safety Marshal, Emergency Response Specialist in commercial buildings and warehouses.'
            },
            'Rigger 1,2,3': {
                syllabus: 'Lifting equipment inspection, crane signaling protocols, load weight calculation, center of gravity analysis, and standard rigging safety procedures.',
                career: 'Certified Rigger, Rigging Supervisor, Lifting Inspector in oil & gas rigs, docks, and heavy industrial construction.'
            },
            'First Aid': {
                syllabus: 'Cardiopulmonary Resuscitation (CPR), managing choking incidents, bleed control mechanisms, fracture stabilization, and managing shock conditions.',
                career: 'Designated Workplace First Aider, Emergency Care Coordinator, Medical Assistant Runner.'
            },
            'Othm Level 3,6,7': {
                syllabus: 'Advanced strategic health & safety management protocols, culture deployment matrices, incident command mechanics, and regulatory compliance benchmarking.',
                career: 'HSE Director, Corporate Safety Advisor, Risk Assessment Consultant globally.'
            },
            'NVQ Level 3,6,7': {
                syllabus: 'Competency-based work assessment portfolio development, practical evidence collection, field inspection deployment, and continuous corporate compliance analysis.',
                career: 'Chartered Safety Practitioner, HSE Auditor, Corporate Safety Executive.'
            },
            'ISO Lead Auditor': {
                syllabus: 'ISO 45001 / 9001 standard clauses, audit scheduling architecture, interviewing techniques, non-conformance reporting, and corrective action follow-up.',
                career: 'Third-Party Certification Auditor, Quality & Safety Management Consultant.'
            },
            'Cyber Security': {
                syllabus: 'Network penetration testing, ethical hacking protocols, Linux architecture configurations, cryptography basics, and firewall defense deployment.',
                career: 'Cyber Security Analyst, Penetration Tester, Network Security Administrator.'
            },
            'AI Engineering': {
                syllabus: 'Python programming foundations, Machine Learning model building, Deep Learning pipelines, prompt optimization systems, and large language model tuning.',
                career: 'AI Developer, Machine Learning Engineer, Prompt Engineer, Automation Specialist.'
            },
            'ICT': {
                syllabus: 'Information and communication setups, advanced networking components, system installation paradigms, and standard digital communications setup.',
                career: 'ICT Assistant, Network Field Support Technician, Systems Operator.'
            },
            'Basic Computer Skills': {
                syllabus: 'Microsoft Word documentation, Excel financial rows creation, PowerPoint slides creation, internet operations, and Windows operating system tools.',
                career: 'Data Entry Operator, Office Assistant, Virtual Admin Support Executive.'
            },
            'Web Development': {
                syllabus: 'HTML5 semantic structures, CSS3 responsive grid frameworks, JavaScript interactivity programming, and clean modern database integration.',
                career: 'Frontend Web Developer, UI Engineer, Full-Stack Freelance Developer.'
            },
            'Graphics Designing': {
                syllabus: 'Adobe Photoshop image treatments, Vector asset design workflows, typography rules, branding concepts, and social media post rendering templates.',
                career: 'Creative Brand Designer, Marketing UI Artist, Freelance Vector Specialist.'
            },
            'Autocad & Revit and Google Sketch Up': {
                syllabus: '2D drafting standards, 3D modeling workflows in AutoCAD & Revit, architectural visualization, and Google SketchUp scene rendering for design presentations.',
                career: 'CAD Draughtsman, BIM Modeler, Architectural Visualization Assistant.'
            },
            'Python': {
                syllabus: 'Python syntax fundamentals, data structures, file handling, OOP concepts, and introductory automation / scripting projects.',
                career: 'Junior Python Developer, Automation Script Writer, Data Analysis Assistant.'
            },
            'C/C++': {
                syllabus: 'C and C++ programming fundamentals, memory management, pointers, OOP in C++, and structured problem-solving for academic and industry projects.',
                career: 'Software Developer, Embedded Systems Trainee, Competitive Programming Candidate.'
            },
            'Microsoft Office': {
                syllabus: 'Word document formatting, Excel formulas & charts, PowerPoint presentations, Outlook basics, and professional office productivity workflows.',
                career: 'Office Administrator, Data Entry Operator, Executive Assistant.'
            },
            'CCNA / CCNA Security': {
                syllabus: 'Routing & switching fundamentals, IP addressing, network protocols, access control, and CCNA Security concepts for enterprise network defense.',
                career: 'Network Administrator, NOC Technician, Junior Network Security Engineer.'
            },
            'Networking': {
                syllabus: 'LAN/WAN architecture, cabling standards, TCP/IP stack, switches & routers configuration basics, and network troubleshooting practices.',
                career: 'Network Support Technician, IT Infrastructure Assistant, Field Network Engineer.'
            },
            'Operating System': {
                syllabus: 'Windows and Linux OS installation, user & permission management, process control, system utilities, and basic shell / command-line operations.',
                career: 'System Support Technician, Desktop Support Engineer, Junior System Administrator.'
            },
            'DIT': {
                syllabus: 'Diploma in Information Technology covering computer fundamentals, office applications, databases basics, networking intro, and internet technologies.',
                career: 'IT Assistant, Computer Operator, Junior Technical Support Staff.'
            },
            'CIT': {
                syllabus: 'Certificate in Information Technology modules including hardware basics, MS Office, internet skills, and introductory programming concepts.',
                career: 'Computer Operator, Front Desk IT Support, Digital Literacy Instructor Assistant.'
            },
            'Software Development': {
                syllabus: 'Software development life cycle, requirement analysis, coding standards, version control basics, and building small full-stack application projects.',
                career: 'Junior Software Developer, Application Support Engineer, Freelance Programmer.'
            },
            'Data Science': {
                syllabus: 'Data analysis pipelines, Python for data science, statistical foundations, visualization dashboards, and introductory machine learning workflows.',
                career: 'Data Analyst, Junior Data Scientist, Business Intelligence Assistant.'
            },
            'Advance Excel': {
                syllabus: 'Advanced formulas, PivotTables, dashboards, Power Query, data validation, and automation with macros for professional reporting.',
                career: 'Excel Analyst, MIS Executive, Reporting Specialist.'
            },
            'Digital Marketing': {
                syllabus: 'SEO fundamentals, social media marketing, Google Ads basics, content strategy, analytics tracking, and campaign performance reporting.',
                career: 'Digital Marketing Executive, Social Media Manager, SEO Specialist.'
            },
            'E-commerce (Shopify, Amazon, etc.)': {
                syllabus: 'Shopify store setup, Amazon seller central basics, product listing optimization, order fulfillment workflows, and multi-channel e-commerce operations.',
                career: 'E-commerce Store Owner, Amazon Seller, Shopify Manager, Online Retail Operations Specialist.'
            },
            'Database Engineering': {
                syllabus: 'Relational database design, SQL queries, normalization, indexing concepts, and practical MySQL / database administration workflows.',
                career: 'Database Developer, SQL Analyst, Junior DBA.'
            },
            'PHP Programming': {
                syllabus: 'PHP syntax, forms & sessions, MySQL integration, MVC patterns, and building dynamic web applications from scratch.',
                career: 'PHP Developer, Backend Web Developer, CMS Customization Specialist.'
            },
            'Physics': {
                syllabus: 'Mechanics, nuclear field physics formulas, thermodynamics, optics principles, electrostatics, and conceptual preparation for matric and FSc board exams.',
                career: 'Excellent baseline for engineering college entry tests and academic board performance.'
            },
            'Chemistry': {
                syllabus: 'Organic chemical compounds synthesis, periodic table trends, electrochemistry balances, atomic models, and lab reaction guidelines.',
                career: 'Pre-requisite academic score optimization for medical and engineering universities.'
            },
            'Biology': {
                syllabus: 'Human physiology systems, genetics mechanisms, cellular structures, plant anatomy, and board-level micro-diagram detailing.',
                career: 'Core foundational mapping for university medical entrance tests and MBBS admissions.'
            },
            'Mathematics': {
                syllabus: 'Calculus derivatives, matrices operations, integration series, complex numbers, and analytical geometry equations.',
                career: 'Essential prerequisite mapping for computer science and engineering fields.'
            },
            'Computer Science': {
                syllabus: 'Programming logic algorithms, hardware architecture models, basic database designs, and object-oriented paradigms.',
                career: 'Foundational baseline tracking for BS Computer Science and Software Engineering.'
            },
            'English Language': {
                syllabus: 'Spoken fluency practice, formal business communication drafting, sentence mechanics, tense matrices, and public speaking confidence drills.',
                career: 'Corporate Assistant, Freelance Communicator, Call Center Associate.'
            },
            'Japanese Language': {
                syllabus: 'Hiragana & Katakana scripts, basic Kanji markers, conversational daily dialogues, and Japanese cultural etiquette protocols.',
                career: 'Overseas Employment Applicant, Language Translator, Visa Entry Support.'
            },
            'Korean Language': {
                syllabus: 'Hangul alphabet, daily interaction phrasing, workplace command vocabulary, and EPS-TOPIK test preparation tracks.',
                career: 'Industrial Work Visa Candidate for South Korea, Technical Document Liaison.'
            },
            'Chinese Language': {
                syllabus: 'Pinyin phonetics, HSK 1 & HSK 2 level character writing, business greetings vocabulary, and tonal pronunciation drills.',
                career: 'CPEC Project Coordinator, Chinese Translation Analyst, Import-Export Expert.'
            },
            'Tuition Classes (2nd to 8th)': {
                syllabus: 'Grade-wise subject coaching for classes 2nd through 8th covering core academics, homework support, and exam preparation.',
                career: 'Strong school foundation for matric readiness and continuous academic improvement.'
            }
        };

        function openSyllabusModal(courseName) {
            const modal = document.getElementById('syllabusModal');
            const title = document.getElementById('modalCourseTitle');
            const syllabusText = document.getElementById('modalCourseSyllabus');
            const careerText = document.getElementById('modalCourseCareer');
            if (!modal || !title || !syllabusText || !careerText) return;

            if (courseDatabase[courseName]) {
                title.innerText = courseName;
                syllabusText.innerText = courseDatabase[courseName].syllabus;
                careerText.innerText = courseDatabase[courseName].career;
            } else {
                title.innerText = courseName;
                syllabusText.innerText = 'Detailed modular syllabus is provided on-desk by the specific faculty stream leader.';
                careerText.innerText = 'High demanding operational professional placements inside local and Gulf regional hubs.';
            }
            modal.classList.add('open');
        }

        function closeSyllabusModal(event) {
            if (event.target.id === 'syllabusModal') {
                forceCloseModal();
            }
        }

        function forceCloseModal() {
            document.getElementById('syllabusModal')?.classList.remove('open');
        }

        // WhatsApp Multi-Department Toggle Menu Logic
        function toggleChatMenu() {
            document.getElementById('chatMenuPanel')?.classList.toggle('active');
        }

        // Dynamic Info Display for Form Field Selection
        function handleCourseSelectionChange(selectElement) {
            const panel = document.getElementById('coursePanel');
            const textSpan = document.getElementById('panelDetailsText');
            if (!panel || !textSpan) return;
            const selected = selectElement?.selectedOptions?.[0];
            const courseName = selected?.dataset?.name || selectElement?.value || "";
            const category = document.getElementById('applyCategorySelect')?.value || "";
            if (courseName) {
                panel.style.display = 'block';
                const duration = selected?.dataset?.duration;
                const bits = [
                    category ? `${category} track` : null,
                    duration ? `Duration: ${duration}` : null
                ].filter(Boolean);
                if (bits.length) {
                    textSpan.innerText = `${courseName} — ${bits.join(' · ')}. Contact us for fee details and customized packages.`;
                } else {
                    textSpan.innerText = `Registration path open for ${courseName}. Contact us for fee details and customized packages.`;
                }
            } else {
                panel.style.display = 'none';
            }
        }

        // =====================================================================
        // Master categorized course catalog — single source of truth for public
        // admission / inquiry dropdowns (must match landing-page "We Offer").
        // =====================================================================
        const MASTER_COURSE_CATALOG = [
            {
                category: "Safety Courses",
                courses: [
                    "IOSH MS V5.0",
                    "OSHA 30 and 48 hours",
                    "Nebosh IGC",
                    "Fire Safety",
                    "Rigger 1,2,3",
                    "First Aid",
                    "Othm Level 3,6,7",
                    "NVQ Level 3,6,7",
                    "ISO Lead Auditor",
                    "BLS (Basic Life Support)",
                    "Scaffolding Supervisor",
                    "WORKING AT HEIGHT",
                    "Work Permit Receiver",
                    "Confined Space",
                    "Risk Assessment",
                    "NDT Level 2"
                ]
            },
            {
                category: "Computer Courses",
                courses: [
                    "Cyber Security",
                    "AI Engineering",
                    "ICT",
                    "Basic Computer Skills",
                    "Web & Software Development",
                    "Graphics Designing",
                    "Autocad & Revit and Google Sketch Up",
                    "Python",
                    "C/C++",
                    "Microsoft Office",
                    "CCNA / CCNA Security",
                    "DIT/CIT",
                    "Data Science",
                    "E-commerce (Shopify, Amazon, etc.)",
                    "Digital Marketing",
                    "Database Engineering"
                ]
            },
            {
                category: "Coaching Classes (Matric & FSC)",
                courses: [
                    "Physics (Engr. Abid Rasheed)",
                    "Chemistry (Ghulam Ullah)",
                    "Biology (Ubaid Rasheed)",
                    "Mathematics (Mohsin Khan)",
                    "Computer Science (Zaid Rasheed)"
                ]
            },
            {
                category: "Other Courses",
                courses: [
                    "Tuition Classes (2nd to 8th)",
                    "English Language",
                    "Japanese Language",
                    "Korean Language",
                    "Chinese Language"
                ]
            }
        ];

        const MASTER_COURSE_CATEGORIES = MASTER_COURSE_CATALOG.map((g) => g.category);
        let publicCoursesCache = [];

        function getMasterCoursesForCategory(category) {
            const group = MASTER_COURSE_CATALOG.find(
                (g) => g.category.toLowerCase() === String(category || "").trim().toLowerCase()
            );
            return group ? [...group.courses] : [];
        }

        function populateSelectWithMasterCourses(select, placeholderText = "-- Choose a course --") {
            if (!select) return;
            const previous = select.value;
            select.innerHTML = "";

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.disabled = true;
            placeholder.selected = true;
            placeholder.textContent = placeholderText;
            select.appendChild(placeholder);

            MASTER_COURSE_CATALOG.forEach((group) => {
                const optgroup = document.createElement("optgroup");
                optgroup.label = group.category;
                group.courses.forEach((name) => {
                    const opt = document.createElement("option");
                    opt.value = name;
                    opt.textContent = name;
                    optgroup.appendChild(opt);
                });
                select.appendChild(optgroup);
            });

            if (previous) {
                const match = Array.from(select.options).find((opt) => opt.value === previous);
                if (match) {
                    select.value = previous;
                    placeholder.selected = false;
                }
            }
        }

        function populateInquiryCourseSelect() {
            populateSelectWithMasterCourses(document.getElementById("inqCourse"), "-- Choose a course --");
            populateSelectWithMasterCourses(document.getElementById("admAppCourse"), "-- Choose a course --");
        }

        function initStudentAdmissionCourseSelect() {
            const courseSelect = document.getElementById("admAppCourse");
            if (!courseSelect) return;
            populateSelectWithMasterCourses(courseSelect, "-- Choose a course --");
        }

        function resolvePublicCourseIdByName(courseName) {
            const needle = String(courseName || "").trim().toLowerCase();
            if (!needle) return null;
            const baseNeedle = needle.replace(/\s*\([^)]*\)\s*$/, "").trim();
            const catalog = publicCoursesCache || [];
            const match = catalog.find((c) => {
                if (c.is_archived) return false;
                const name = String(c.name || "").trim().toLowerCase();
                if (!name) return false;
                return name === needle
                    || name === baseNeedle
                    || needle.startsWith(name)
                    || name.startsWith(baseNeedle);
            });
            return match?.id || null;
        }

        function resetApplyCourseSelect(placeholder = "-- Select a category first --") {
            const courseSelect = document.getElementById("applyCourseSelect");
            if (!courseSelect) return;
            courseSelect.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
            courseSelect.value = "";
            courseSelect.disabled = true;
            const panel = document.getElementById("coursePanel");
            if (panel) panel.style.display = "none";
        }

        function rebuildApplyCategorySelect(categories) {
            const select = document.getElementById("applyCategorySelect");
            if (!select) return;
            const previous = select.value;
            select.innerHTML = "";
            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.disabled = true;
            placeholder.selected = true;
            placeholder.textContent = "-- Choose Category --";
            select.appendChild(placeholder);

            const seen = new Set();
            (categories || []).forEach((raw) => {
                const label = String(raw || "").trim();
                if (!label) return;
                const key = label.toLowerCase();
                if (seen.has(key)) return;
                seen.add(key);
                const opt = document.createElement("option");
                opt.value = label;
                opt.textContent = label;
                select.appendChild(opt);
            });

            if (previous && seen.has(previous.toLowerCase())) {
                const match = Array.from(select.options).find(
                    (opt) => opt.value.toLowerCase() === previous.toLowerCase()
                );
                if (match) {
                    select.value = match.value;
                    placeholder.selected = false;
                }
            }
        }

        function populateApplyCoursesForCategory(category) {
            const courseSelect = document.getElementById("applyCourseSelect");
            if (!courseSelect) return;

            if (!category) {
                resetApplyCourseSelect();
                return;
            }

            const matches = getMasterCoursesForCategory(category);

            courseSelect.innerHTML = "";
            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.disabled = true;
            placeholder.selected = true;
            placeholder.textContent = matches.length ? "-- Choose Course --" : "-- No courses in this category --";
            courseSelect.appendChild(placeholder);

            matches.forEach((courseName) => {
                const opt = document.createElement("option");
                const resolvedId = resolvePublicCourseIdByName(courseName);
                opt.value = resolvedId || courseName;
                opt.textContent = courseName;
                opt.dataset.name = courseName;
                opt.dataset.category = category;
                courseSelect.appendChild(opt);
            });

            courseSelect.disabled = matches.length === 0;
            const panel = document.getElementById("coursePanel");
            if (panel) panel.style.display = "none";
        }

        function handleApplyCategoryChange(selectElement) {
            const category = selectElement?.value || "";
            populateApplyCoursesForCategory(category);
        }

        async function initApplyOnlineCourseSelects() {
            const categorySelect = document.getElementById("applyCategorySelect");
            const courseSelect = document.getElementById("applyCourseSelect");

            populateInquiryCourseSelect();
            initStudentAdmissionCourseSelect();

            if (!categorySelect || !courseSelect) return;

            resetApplyCourseSelect();
            rebuildApplyCategorySelect(MASTER_COURSE_CATEGORIES);

            if (!supabaseClient) {
                console.warn("[Apply Online] Supabase not configured — using master course catalog only.");
                return;
            }

            try {
                // Cache live DB courses for optional course_id resolution on submit
                const { data, error } = await supabaseClient
                    .from("courses")
                    .select("id, name, category, description, duration, is_archived")
                    .eq("is_archived", false)
                    .order("name", { ascending: true });

                if (error) throw error;

                publicCoursesCache = data || [];

                // Re-bind course options so resolved IDs attach when a category is chosen
                if (categorySelect.value) {
                    populateApplyCoursesForCategory(categorySelect.value);
                }

                console.log(
                    "[Apply Online] Master catalog ready;",
                    publicCoursesCache.length,
                    "DB courses cached for ID matching"
                );
            } catch (err) {
                console.error("[Apply Online] Failed to load DB courses for ID matching:", err);
                publicCoursesCache = [];
            }
        }

        function getSelectedApplyCourseMeta() {
            const courseSelect = document.getElementById("applyCourseSelect");
            const categorySelect = document.getElementById("applyCategorySelect");
            const selected = courseSelect?.selectedOptions?.[0];
            const courseName = String(selected?.dataset?.name || selected?.textContent || "").trim();
            const category = String(selected?.dataset?.category || categorySelect?.value || "").trim();
            const rawValue = courseSelect?.value || "";
            const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawValue);
            const courseId = looksLikeUuid
                ? rawValue
                : (resolvePublicCourseIdByName(courseName) || "");
            const fromCache = publicCoursesCache.find((c) => c.id === courseId) || null;
            return {
                courseId,
                courseName: String(courseName || fromCache?.name || "").trim(),
                category: String(category || fromCache?.category || "").trim(),
                duration: selected?.dataset?.duration || fromCache?.duration || "",
                description: selected?.dataset?.description || fromCache?.description || ""
            };
        }

        // Multi-Step Form Wizard Linear Navigation Logic
        function navigateWizard(currentStep, targetStep) {
            const currentEl = document.getElementById(`wizardStep${currentStep}`);
            const targetEl = document.getElementById(`wizardStep${targetStep}`);
            const currentNode = document.getElementById(`stepNode${currentStep}`);
            const targetNode = document.getElementById(`stepNode${targetStep}`);
            const progressFill = document.getElementById('wizardProgressFill');
            if (!currentEl || !targetEl || !currentNode || !targetNode) return;

            if (targetStep > currentStep) {
                const inputs = currentEl.querySelectorAll('[required]');
                let stepValid = true;
                inputs.forEach(input => {
                    if (input.disabled) return;
                    if (!input.value || input.classList.contains('input-invalid')) {
                        input.classList.add('input-invalid');
                        stepValid = false;
                    }
                });
                if (!stepValid) {
                    showToast("⚠️ Please fill in all mandatory required fields correctly before moving on.", "info");
                    return;
                }
            }

            currentEl.classList.remove('active');
            targetEl.classList.add('active');

            currentNode.classList.remove('active');
            if (targetStep > currentStep) {
                currentNode.classList.add('completed');
            } else {
                targetNode.classList.remove('completed');
            }
            targetNode.classList.add('active');

            const totalSteps = 3;
            const percentage = ((targetStep - 1) / (totalSteps - 1)) * 100;
            if (progressFill) progressFill.style.width = `${percentage}%`;
        }

        /**
         * Public lead insert into public.leads.
         * Core columns: full_name, email, phone, course_interest, message, status
         * Optional profile columns: father_name, dob, course_id (for Lead→Student promotion)
         * Do NOT chain .select() — anon RLS allows INSERT only, not SELECT.
         */
        async function insertPublicLead(payload) {
            if (!supabaseClient) {
                const err = new Error("Supabase client is not configured.");
                console.error("[Leads] Insert blocked:", err.message);
                return { error: err };
            }

            const cleanPayload = sanitizePublicLeadPayload(payload);

            console.log("[Leads] Inserting into public.leads:", cleanPayload);

            try {
                let { error } = await supabaseClient.from("leads").insert(cleanPayload);

                // Graceful fallback if upgrade columns are not applied yet
                if (error && /father_name|dob|course_id|column/i.test(String(error.message || ""))) {
                    console.warn("[Leads] Retrying insert without optional profile columns:", error.message);
                    const legacyPayload = {
                        full_name: cleanPayload.full_name,
                        email: cleanPayload.email,
                        phone: cleanPayload.phone,
                        course_interest: cleanPayload.course_interest,
                        message: cleanPayload.message,
                        status: cleanPayload.status
                    };
                    ({ error } = await supabaseClient.from("leads").insert(legacyPayload));
                }

                if (error) {
                    console.error("[Leads] Database insertion error:", error);
                    console.error("[Leads] code:", error.code);
                    console.error("[Leads] message:", error.message);
                    console.error("[Leads] details:", error.details);
                    console.error("[Leads] hint:", error.hint);
                    console.error("[Leads] full:", JSON.stringify(error, null, 2));
                    return { error };
                }
                console.log("[Leads] Insert succeeded.");
                if (document.getElementById("adminDashboard") && !document.getElementById("adminDashboard").hidden) {
                    refreshAdminLeads().catch((refreshErr) => {
                        console.warn("[Leads] Admin refresh after insert failed:", refreshErr);
                    });
                }
                return { error: null };
            } catch (err) {
                console.error("[Leads] Unexpected insert failure:", err);
                return { error: err };
            }
        }

        function resetAdmissionWizardForm() {
            const form = document.getElementById("admissionWizardForm");
            if (form) form.reset();
            resetApplyCourseSelect();
            ["wizardStep1", "wizardStep2", "wizardStep3"].forEach((id, index) => {
                const step = document.getElementById(id);
                if (!step) return;
                step.classList.toggle("active", index === 0);
            });
            ["stepNode1", "stepNode2", "stepNode3"].forEach((id, index) => {
                const node = document.getElementById(id);
                if (!node) return;
                node.classList.toggle("active", index === 0);
                node.classList.remove("completed");
            });
            const fill = document.getElementById("wizardProgressFill");
            if (fill) fill.style.width = "0%";
            const panel = document.getElementById("coursePanel");
            if (panel) panel.style.display = "none";
        }

        function showInquirySuccessToast() {
            showToast("Thank you! Our team will contact you shortly.", "success");
        }

        // Form Wizard Structured Order Processing Submission handler
        async function handleWizardSubmit(event) {
            event.preventDefault();
            if (!document.getElementById("admissionWizardForm")) return;
            const nameEl = document.getElementById('fullName');
            const fatherEl = document.getElementById('fatherName');
            const dobEl = document.getElementById('applicantDob');
            const phoneEl = document.getElementById('whatsappNo');
            const emailEl = document.getElementById('studentEmail');
            const educationEl = document.getElementById('educationSelect');
            if (!nameEl || !fatherEl || !dobEl || !phoneEl || !emailEl || !educationEl) return;

            const name = sanitizeInput(nameEl.value, { maxLength: 120 });
            const fatherName = sanitizeInput(fatherEl.value || "", { maxLength: 120 });
            const dob = sanitizeInput(dobEl.value || "", { maxLength: 10 });
            const phone = sanitizePhone(phoneEl.value);
            const emailRaw = sanitizeInput(emailEl.value || "", {
                maxLength: 120,
                preserveEmail: true
            });
            const education = sanitizeInput(educationEl.value, { maxLength: 80 });
            const notes = sanitizeInput(document.getElementById('additionalNotes')?.value || "None", {
                maxLength: 1000,
                allowNewlines: true
            }) || "None";
            const { courseId, courseName, category } = getSelectedApplyCourseMeta();
            const safeCourseName = sanitizeInput(courseName, { maxLength: 150 });
            const safeCategory = sanitizeInput(category, { maxLength: 80 });
            const submitBtn = event.submitter || event.target?.querySelector('[type="submit"]');
            const submitBtnOriginal = submitBtn ? submitBtn.textContent : "";

            if (!name || !fatherName || !dob || !phone || !emailRaw) {
                showToast("Please complete name, father's name, date of birth, contact, and email.", "info");
                return;
            }
            if (!isValidEmail(emailRaw)) {
                showToast("Please enter a valid email address.", "info");
                return;
            }
            if (!safeCourseName) {
                showToast("Please select a category and course before submitting.", "warning");
                return;
            }

            const courseInterest = safeCategory ? `${safeCategory} › ${safeCourseName}` : safeCourseName;
            const messageBody = [
                `Online admission request`,
                `Father: ${fatherName}`,
                `DOB: ${dob}`,
                `Category: ${safeCategory || "—"}`,
                `Course: ${safeCourseName}`,
                courseId ? `Course ID: ${courseId}` : null,
                `Education: ${education}`,
                `Notes: ${notes}`
            ].filter(Boolean).join("\n");

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Submitting…";
            }

            const { error } = await insertPublicLead({
                full_name: name,
                father_name: fatherName,
                dob,
                email: normalizeEmail(emailRaw),
                phone: phone || null,
                course_id: courseId || null,
                course_interest: courseInterest,
                message: messageBody,
                status: "new"
            });

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = submitBtnOriginal || "Complete Admission Request";
            }

            if (error) {
                showToast("We could not submit your application right now. Please try again shortly.", "warning");
                return;
            }

            resetAdmissionWizardForm();
            showInquirySuccessToast();
        }

        // Instant Call Request Processing
        function handleCallbackSubmit(event) {
            event.preventDefault();
            const phoneNum = sanitizePhone(document.getElementById('callbackPhone').value);
            if (!phoneNum) {
                showToast("Please enter a valid phone number.", "info");
                return;
            }
            showToast(`✅ Callback request queued successfully for ${escapeHtml(phoneNum)}!`, "success");
            document.getElementById('callbackPhone').value = "";
        }

        // Modern Toast Notification Alert Controller
        function showToast(message, type = "success") {
            const container = document.getElementById('toastContainer');
            if (!container) return;
            const toast = document.createElement('div');
            toast.className = `toast-modern ${type}`;

            const icon =
                type === "success" ? "✅" :
                type === "warning" ? "⚠️" :
                type === "secret" ? "🔐" :
                "ℹ️";
            toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;

            container.appendChild(toast);
            const holdMs = type === "secret" ? 3200 : type === "warning" ? 4500 : type === "success" ? 5200 : 4000;
            setTimeout(() => {
                toast.classList.add('toast-exit');
                setTimeout(() => toast.remove(), 350);
            }, holdMs);
        }

        function setButtonLoading(button, isLoading, loadingText = "Working…") {
            if (!button) return;
            if (isLoading) {
                if (!button.dataset.originalHtml) {
                    button.dataset.originalHtml = button.innerHTML;
                }
                button.disabled = true;
                button.classList.add('is-loading');
                button.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span> ${loadingText}`;
            } else {
                button.disabled = false;
                button.classList.remove('is-loading');
                if (button.dataset.originalHtml) {
                    button.innerHTML = button.dataset.originalHtml;
                    delete button.dataset.originalHtml;
                }
            }
        }

        function resolveEventButton(eventOrButton) {
            if (!eventOrButton) return null;
            if (eventOrButton instanceof HTMLElement) return eventOrButton;
            const target = eventOrButton.target || eventOrButton.currentTarget;
            if (!(target instanceof HTMLElement)) return null;
            return target.closest('button, .admin-action-btn, .wizard-btn, .cta-btn') || target;
        }

        // Light/Dark Theme Switching Controller
        const THEME_STORAGE_KEY = "tsi_theme_preference_v1";

        function isLightThemeActive() {
            return document.body.classList.contains("light-mode");
        }

        function syncThemeToggleIcon(isLight = isLightThemeActive()) {
            const modeBtn = document.getElementById("themeToggleBtn");
            if (!modeBtn) return;
            modeBtn.classList.toggle("is-light", isLight);
            modeBtn.setAttribute("aria-pressed", isLight ? "true" : "false");
            modeBtn.setAttribute(
                "aria-label",
                isLight ? "Switch to dark mode" : "Switch to light mode"
            );
            modeBtn.title = isLight ? "Switch to dark mode" : "Switch to light mode";
        }

        function applyThemePreference(isLight, options = {}) {
            const { persist = true, toast = false } = options;
            document.body.classList.toggle("light-mode", Boolean(isLight));
            syncThemeToggleIcon(Boolean(isLight));
            if (persist) {
                try {
                    localStorage.setItem(THEME_STORAGE_KEY, isLight ? "light" : "dark");
                } catch (err) {
                    console.warn("[Theme] Unable to persist preference:", err);
                }
            }
            renderAdminAnalyticsCharts();
            if (toast) {
                showToast(isLight ? "Light mode enabled." : "Dark mode enabled.", "info");
            }
        }

        function toggleLightMode() {
            applyThemePreference(!isLightThemeActive(), { persist: true, toast: true });
        }

        function initThemePreference() {
            let stored = null;
            try {
                stored = localStorage.getItem(THEME_STORAGE_KEY);
            } catch (err) {
                console.warn("[Theme] Unable to read preference:", err);
            }
            if (stored === "light" || stored === "dark") {
                applyThemePreference(stored === "light", { persist: false, toast: false });
                return;
            }
            syncThemeToggleIcon(isLightThemeActive());
        }

        // Testimonial Engine Rotator Logic
        let activeTestimonialIndex = 0;
        const testimonialSlides = document.getElementsByClassName('testimonial-slide');
        const testimonialDots = document.getElementsByClassName('slider-dot');

        function setTestimonial(index) {
            if (!testimonialSlides.length || !testimonialDots.length) return;
            const safeIndex = ((index % testimonialSlides.length) + testimonialSlides.length) % testimonialSlides.length;
            testimonialSlides[activeTestimonialIndex]?.classList.remove('active');
            testimonialDots[activeTestimonialIndex]?.classList.remove('active');
            activeTestimonialIndex = safeIndex;
            testimonialSlides[activeTestimonialIndex]?.classList.add('active');
            testimonialDots[activeTestimonialIndex]?.classList.add('active');
        }

        function autoRotateTestimonials() {
            if (!testimonialSlides.length) return;
            let next = activeTestimonialIndex + 1;
            if (next >= testimonialSlides.length) next = 0;
            setTestimonial(next);
        }
        setInterval(autoRotateTestimonials, 6000);

        // Accordion engine logic for UI FAQ block elements
        function toggleFaq(element) {
            if (!element) return;
            const item = element.parentElement;
            const sign = element.querySelector('span');
            if (!item || !sign) return;
            item.classList.toggle('active');
            sign.innerText = item.classList.contains('active') ? "−" : "+";
        }

        function getAppContext() {
            const path = String(window.location.pathname || "").replace(/\\/g, "/").toLowerCase();
            const isAdminDir = /\/admin(?:\/|$)/.test(path);
            const isAdminLogin = isAdminDir && path.endsWith("login.html");
            const isAdminDashboard = isAdminDir && path.endsWith("dashboard.html");
            return {
                path,
                isAdminDir,
                isAdminLogin,
                isAdminDashboard,
                isPublic: !isAdminDir
            };
        }

        function resolveSiteAsset(relativePath) {
            const clean = String(relativePath || "").replace(/^\.\//, "");
            return getAppContext().isAdminDir ? `../${clean}` : clean;
        }

        function getAdminLoginHref() {
            return getAppContext().isAdminDir ? "login.html" : "admin/login.html";
        }

        function initMobileNav() {
            const toggle = document.getElementById("navToggleBtn");
            const links = document.getElementById("publicNavLinks");
            if (!toggle || !links) return;

            let backdrop = document.getElementById("navMobileBackdrop");
            if (!backdrop) {
                backdrop = document.createElement("div");
                backdrop.id = "navMobileBackdrop";
                backdrop.className = "nav-mobile-backdrop";
                backdrop.setAttribute("aria-hidden", "true");
                document.body.appendChild(backdrop);
            }

            const setOpen = (open) => {
                links.classList.toggle("is-open", open);
                toggle.classList.toggle("is-open", open);
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
                toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
                backdrop.classList.toggle("is-visible", open);
                backdrop.setAttribute("aria-hidden", open ? "false" : "true");
                document.body.classList.toggle("nav-drawer-open", open);
                if (!open) {
                    links.querySelectorAll(".nav-dropdown.is-open").forEach((el) => {
                        el.classList.remove("is-open");
                        el.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
                    });
                }
            };

            toggle.addEventListener("click", (event) => {
                event.stopPropagation();
                setOpen(!links.classList.contains("is-open"));
            });

            backdrop.addEventListener("click", () => setOpen(false));

            links.querySelectorAll(":scope > li > a").forEach((anchor) => {
                anchor.addEventListener("click", () => setOpen(false));
            });

            links.querySelectorAll(".nav-dropdown-toggle").forEach((btn) => {
                btn.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const parent = btn.closest(".nav-dropdown");
                    if (!parent) return;
                    const willOpen = !parent.classList.contains("is-open");
                    links.querySelectorAll(".nav-dropdown.is-open").forEach((el) => {
                        if (el !== parent) {
                            el.classList.remove("is-open");
                            el.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
                        }
                    });
                    parent.classList.toggle("is-open", willOpen);
                    btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
                });
            });

            links.querySelectorAll(".nav-dropdown-menu a").forEach((anchor) => {
                anchor.addEventListener("click", () => setOpen(false));
            });

            document.addEventListener("keydown", (event) => {
                if (event.key === "Escape") setOpen(false);
            });

            document.addEventListener("click", (event) => {
                if (!links.classList.contains("is-open")) return;
                if (links.contains(event.target) || toggle.contains(event.target)) return;
                setOpen(false);
            });

            window.addEventListener("resize", () => {
                if (window.innerWidth > 768) setOpen(false);
            });
        }

        function scrollFieldIntoViewWithNavOffset(el, offsetPx = 80) {
            if (!(el instanceof HTMLElement)) return;
            try {
                const top = el.getBoundingClientRect().top + window.pageYOffset - offsetPx;
                window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
            } catch (_) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }

        function initMobileFormFocusScroll() {
            const isMobile = () => window.matchMedia("(max-width: 768px)").matches;
            document.addEventListener("focusin", (event) => {
                if (!isMobile()) return;
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;
                if (!["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
                if (target.type === "hidden" || target.type === "checkbox" || target.type === "radio" || target.type === "file") return;
                window.setTimeout(() => scrollFieldIntoViewWithNavOffset(target, 80), 120);
            }, true);
        }

        function initFormEnterNavigation() {
            const isFocusableField = (el) => {
                if (!(el instanceof HTMLElement)) return false;
                if (el.disabled || el.readOnly) return false;
                if (el.type === "hidden" || el.type === "submit" || el.type === "button" || el.type === "reset" || el.type === "file") return false;
                if (el.getAttribute("contenteditable") === "true") return false;
                const style = window.getComputedStyle(el);
                if (style.display === "none" || style.visibility === "hidden") return false;
                return el.offsetParent !== null || style.position === "fixed";
            };

            document.addEventListener("keydown", (event) => {
                if (event.key !== "Enter") return;
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;
                if (target.tagName === "TEXTAREA") return;
                if (target.isContentEditable) return;
                if (!["INPUT", "SELECT"].includes(target.tagName)) return;

                const form = target.closest("form");
                if (!form) return;

                const fields = Array.from(
                    form.querySelectorAll("input, select, textarea")
                ).filter(isFocusableField);

                const index = fields.indexOf(target);
                if (index < 0) return;

                const isLast = index >= fields.length - 1;
                if (isLast) return; // allow native submit on final field

                event.preventDefault();
                const next = fields[index + 1];
                if (!next) return;
                next.focus({ preventScroll: true });
                try {
                    if (typeof next.select === "function" && next.tagName === "INPUT" && next.type !== "date" && next.type !== "checkbox" && next.type !== "radio") {
                        next.select();
                    }
                } catch (_) { /* ignore */ }
                scrollFieldIntoViewWithNavOffset(next, 80);
            }, true);
        }

        function initScrollRevealAnimations() {
            const targets = document.querySelectorAll(
                ".page-band, .about-block, .facility-card, .faculty-member-card, .contact-info-card, .metric-card, .featured-course-card, .category-card, .admission-cta-band, .interior-panel, .reveal-on-scroll"
            );
            if (!targets.length) return;

            targets.forEach((el) => el.classList.add("reveal-on-scroll"));

            if (!("IntersectionObserver" in window)) {
                targets.forEach((el) => el.classList.add("is-revealed"));
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-revealed");
                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

            targets.forEach((el) => observer.observe(el));
        }

        // =====================================================================
        // Certificate Verification & QR Code Scanning System (Supabase-backed)
        // FR-6.1 to FR-6.4 — multi-field match + client rate limiting
        // =====================================================================

        // TODO: Replace these placeholders with your actual Supabase project credentials.
        // Find them in: Supabase Dashboard > Project Settings > API
        // SECURITY: Browser clients must use ONLY the public anon / publishable key.
        // Never paste a service_role or secret key into frontend code.
        const SUPABASE_URL = "https://ngcbflylskwrtugxfzgu.supabase.co"; // e.g. "https://xxxxxxxxxxxxx.supabase.co"
        const SUPABASE_ANON_KEY = "sb_publishable_Ybn6aXVh2xo9VvV7RvwllQ_gPMdYgGq"; // the "anon public" API key

        // Public origin used inside generated QR deep-links.
        const PUBLIC_SITE_ORIGIN = "https://spectruminstitute.uk";

        function assertPublicSupabaseKey(key) {
            const raw = String(key || "").trim();
            if (!raw) return false;
            if (/service_role|secret/i.test(raw)) {
                console.error("[Security] Refusing to init Supabase with a service_role/secret key in the browser.");
                return false;
            }
            // Accept legacy JWT anon keys (eyJ…) and new publishable keys (sb_publishable_…)
            return raw.startsWith("sb_publishable_") || raw.startsWith("eyJ") || raw.length > 20;
        }

        // `supabase` is exposed globally by the supabase-js CDN script.
        // Prefer a client already created by admin-auth.js on /admin pages.
        const supabaseClient = (window.__tsiSupabase)
            || ((typeof supabase !== "undefined"
                && SUPABASE_URL.startsWith("http")
                && assertPublicSupabaseKey(SUPABASE_ANON_KEY))
                ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
                : null);
        if (supabaseClient) window.__tsiSupabase = supabaseClient;

        let html5QrCodeScanner = null;
        const VERIFY_RATE_LIMIT_MAX = 5;
        const VERIFY_RATE_STORAGE_KEY = "tsi_verify_attempts_v1";

        function getVerifyAttemptCount() {
            const raw = Number(sessionStorage.getItem(VERIFY_RATE_STORAGE_KEY) || "0");
            return Number.isFinite(raw) && raw > 0 ? raw : 0;
        }

        function incrementVerifyAttemptCount() {
            const next = getVerifyAttemptCount() + 1;
            sessionStorage.setItem(VERIFY_RATE_STORAGE_KEY, String(next));
            updateVerifyRateHint();
            return next;
        }

        function updateVerifyRateHint() {
            const hint = document.getElementById('verifyRateHint');
            const btn = document.getElementById('verifySubmitBtn');
            if (!hint) return;
            const used = getVerifyAttemptCount();
            const remaining = Math.max(0, VERIFY_RATE_LIMIT_MAX - used);
            if (remaining <= 0) {
                hint.textContent = "Verification locked for this browser session (5/5 attempts used). Refresh later or contact the institute.";
                hint.classList.add('is-locked');
                if (btn) btn.disabled = true;
            } else {
                hint.textContent = `${remaining} verification attempt${remaining === 1 ? "" : "s"} remaining in this browser session.`;
                hint.classList.remove('is-locked');
                if (btn) btn.disabled = false;
            }
        }

        function normalizePersonName(value) {
            return String(value || "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ");
        }

        function getTodayDateKey() {
            const today = new Date();
            return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        }

        function buildVerificationUrl(certificateId) {
            const serialNumber = String(certificateId || "").trim().toUpperCase();
            const origin = (PUBLIC_SITE_ORIGIN || window.location.origin || "").replace(/\/$/, "");
            const base = origin ? `${origin}/verify.html` : "verify.html";
            return `${base}?serial=${encodeURIComponent(serialNumber)}`;
        }

        // Core lookup — RPC-only (never direct SELECT on certificates).
        // Calls public.verify_certificate and returns only safe display fields.
        // options.serialOnly: QR deep-link flow — Certificate ID alone is enough.
        async function verifyCertificate(certId, studentName, fatherName, studentDob, options = {}) {
            const resultCard = document.getElementById('verifyResultCard');
            if (!resultCard) return;

            const cleanCertId = sanitizeInput(certId, { maxLength: 64 }).toUpperCase();
            const cleanName = sanitizeInput(studentName, { maxLength: 120 });
            const cleanFatherName = sanitizeInput(fatherName, { maxLength: 120 });
            const cleanDob = sanitizeInput(studentDob, { maxLength: 10 });
            const serialOnly = Boolean(options.serialOnly);

            if (!cleanCertId) {
                showToast("⚠️ Certificate ID / serial number is required.", "info");
                return;
            }
            if (!serialOnly && (!cleanName || !cleanFatherName || !cleanDob)) {
                showToast("⚠️ Certificate ID, student name, father's name, and date of birth are all required.", "info");
                return;
            }

            if (getVerifyAttemptCount() >= VERIFY_RATE_LIMIT_MAX) {
                updateVerifyRateHint();
                resultCard.classList.add('show');
                resultCard.classList.remove('loading');
                resultCard.innerHTML = renderVerifyErrorMarkup("Too many verification attempts from this browser. Please wait or contact The Spectrum Institute for help.");
                return;
            }

            incrementVerifyAttemptCount();

            resultCard.classList.add('show');
            resultCard.classList.add('loading');
            resultCard.innerHTML = `<div class="verify-loading loading-inline"><span class="micro-spinner" aria-hidden="true"></span> Verifying certificate, please wait...</div>`;

            if (!supabaseClient) {
                resultCard.classList.remove('loading');
                resultCard.innerHTML = renderVerifyErrorMarkup("Verification service is not configured yet. Please contact the institute directly.");
                return;
            }

            try {
                const rpcPayload = { p_certificate_id: cleanCertId };
                if (!serialOnly) {
                    rpcPayload.p_student_name = cleanName;
                    rpcPayload.p_father_name = cleanFatherName;
                    rpcPayload.p_dob = cleanDob;
                }

                const rpcResult = await supabaseClient.rpc('verify_certificate', rpcPayload);

                if (rpcResult.error) {
                    console.error("[Verify] verify_certificate RPC error:", rpcResult.error);
                    throw rpcResult.error;
                }

                const matched = Array.isArray(rpcResult.data)
                    ? rpcResult.data[0]
                    : rpcResult.data;

                resultCard.classList.remove('loading');

                if (!matched) {
                    const failMsg = serialOnly
                        ? "Invalid or Expired Certificate QR Code"
                        : "Verification Failed / Details Mismatched — one or more fields did not match a valid certificate record.";
                    resultCard.innerHTML = renderVerifyErrorMarkup(failMsg);
                    if (serialOnly && !options.silentToast) {
                        showToast("⚠️ Invalid or Expired Certificate QR Code", "warning");
                    }
                    return;
                }

                const safeCert = {
                    certificate_id: matched.certificate_id || cleanCertId,
                    student_name: matched.student_name || "",
                    father_name: matched.father_name || "",
                    course_name: matched.course_name || "",
                    issue_date: matched.issue_date || null,
                    grade: matched.grade || "",
                    status: "active",
                    expiry_date: null
                };

                // Prefill form so users see the verified identity fields.
                const nameInput = document.getElementById('verifyStudentName');
                const fatherInput = document.getElementById('verifyFatherName');
                if (serialOnly) {
                    if (nameInput && safeCert.student_name) nameInput.value = safeCert.student_name;
                    if (fatherInput && safeCert.father_name) fatherInput.value = safeCert.father_name;
                }

                renderVerifySuccessMarkup(safeCert);
                scrollToVerifyResult();
                if (!options.silentToast) {
                    showToast("✅ Certificate verified successfully.", "success");
                }
            } catch (err) {
                console.error('Unexpected verification error:', err);
                resultCard.classList.remove('loading');
                resultCard.innerHTML = renderVerifyErrorMarkup(
                    serialOnly
                        ? "Invalid or Expired Certificate QR Code"
                        : "Unexpected error occurred. Please check your internet connection and try again."
                );
                if (serialOnly) {
                    showToast("⚠️ Invalid or Expired Certificate QR Code", "warning");
                }
            }
        }

        function renderVerifySuccessMarkup(cert) {
            const resultCard = document.getElementById('verifyResultCard');
            const today = getTodayDateKey();
            const isExpired = Boolean(cert.expiry_date && String(cert.expiry_date).slice(0, 10) < today);
            const statusBadge = isExpired
                ? `<span class="verify-badge expired">EXPIRED</span>`
                : `<span class="verify-badge verified">Verified ✅</span>`;

            const issueDate = cert.issue_date
                ? new Date(cert.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : "N/A";
            const expiryDate = cert.expiry_date ? formatDisplayDate(cert.expiry_date) : "No expiry";

            resultCard.innerHTML = `
                <div class="verify-result-header">
                    ${statusBadge}
                    <span class="verify-cert-id">${escapeHtml(cert.certificate_id)}</span>
                </div>
                <div class="verify-details-grid">
                    <div class="verify-detail-item">
                        <span class="verify-detail-label">Student Name</span>
                        <span class="verify-detail-value">${escapeHtml(cert.student_name || "N/A")}</span>
                    </div>
                    <div class="verify-detail-item">
                        <span class="verify-detail-label">Father Name</span>
                        <span class="verify-detail-value">${escapeHtml(cert.father_name || "N/A")}</span>
                    </div>
                    <div class="verify-detail-item">
                        <span class="verify-detail-label">Course</span>
                        <span class="verify-detail-value">${escapeHtml(cert.course_name || "N/A")}</span>
                    </div>
                    <div class="verify-detail-item">
                        <span class="verify-detail-label">Issue Date</span>
                        <span class="verify-detail-value">${escapeHtml(issueDate)}</span>
                    </div>
                    <div class="verify-detail-item">
                        <span class="verify-detail-label">Expiry Date</span>
                        <span class="verify-detail-value">${escapeHtml(expiryDate)}</span>
                    </div>
                    <div class="verify-detail-item">
                        <span class="verify-detail-label">Grade</span>
                        <span class="verify-detail-value">${escapeHtml(cert.grade || "N/A")}</span>
                    </div>
                    <div class="verify-detail-item">
                        <span class="verify-detail-label">Status</span>
                        <span class="verify-detail-value">Active / Authentic</span>
                    </div>
                </div>
            `;
        }

        function renderVerifyErrorMarkup(message) {
            return `
                <div class="verify-error-state">
                    <div class="verify-error-icon">❌</div>
                    <p>${escapeHtml(message)}</p>
                </div>
            `;
        }

        function handleVerifyButtonClick(event) {
            if (event) event.preventDefault();
            const certId = document.getElementById('certIdInput')?.value || "";
            const studentName = document.getElementById('verifyStudentName')?.value || "";
            const fatherName = document.getElementById('verifyFatherName')?.value || "";
            const studentDob = document.getElementById('verifyStudentDob')?.value || "";
            verifyCertificate(certId, studentName, fatherName, studentDob);
        }

        // ---------------- QR Code Scanner Logic (html5-qrcode) ----------------

        function openQrScanner() {
            const modal = document.getElementById('qrScannerModal');
            const reader = document.getElementById('qrReaderContainer');
            if (!modal || !reader) return;
            modal.classList.add('open');

            if (typeof Html5Qrcode === "undefined") {
                reader.innerHTML =
                    `<p class="qr-hint">⚠️ QR scanner library failed to load. Please check your internet connection.</p>`;
                return;
            }

            html5QrCodeScanner = new Html5Qrcode("qrReaderContainer");
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            html5QrCodeScanner.start(
                { facingMode: "environment" },
                config,
                onQrScanSuccess,
                function onScanFailure() { /* ignore per-frame scan misses */ }
            ).catch((err) => {
                console.error('Camera start error:', err);
                reader.innerHTML =
                    `<p class="qr-hint">⚠️ Unable to access camera. Please grant camera permission and try again.</p>`;
            });
        }

        function closeQrScanner() {
            const modal = document.getElementById('qrScannerModal');
            if (modal) modal.classList.remove('open');

            if (html5QrCodeScanner) {
                html5QrCodeScanner.stop().then(() => {
                    html5QrCodeScanner.clear();
                    html5QrCodeScanner = null;
                }).catch(() => {
                    html5QrCodeScanner = null;
                });
            }
        }

        function closeQrScannerOnOverlay(event) {
            if (event.target.id === 'qrScannerModal') {
                closeQrScanner();
            }
        }

        function onQrScanSuccess(decodedText) {
            showToast("✅ QR Code scanned successfully!", "success");
            closeQrScanner();

            const certId = extractCertIdFromScannedText(decodedText);
            if (certId) {
                const input = document.getElementById('certIdInput');
                if (input) input.value = certId;
                scrollToVerifySection();

                const studentName = document.getElementById('verifyStudentName')?.value || "";
                const fatherName = document.getElementById('verifyFatherName')?.value || "";
                const studentDob = document.getElementById('verifyStudentDob')?.value || "";
                if (studentName && fatherName && studentDob) {
                    verifyCertificate(certId, studentName, fatherName, studentDob);
                } else {
                    // Deep-link QR encodes serial only — verify immediately via RPC.
                    verifyCertificate(certId, "", "", "", { serialOnly: true });
                }
            } else {
                showToast("⚠️ Unrecognized QR code format.", "info");
            }
        }

        function extractCertIdFromScannedText(rawText) {
            const raw = String(rawText || "").trim();
            if (!raw) return "";
            try {
                const url = new URL(raw);
                return (
                    url.searchParams.get("serial")
                    || url.searchParams.get("id")
                    || url.searchParams.get("verify")
                    || ""
                ).trim().toUpperCase();
            } catch (e) {
                // Plain serial text (legacy QR payloads)
                return raw.toUpperCase();
            }
        }

        function scrollToVerifySection() {
            const section = document.getElementById('verify-heading') || document.getElementById('verify');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        function scrollToVerifyResult() {
            const resultCard = document.getElementById('verifyResultCard');
            if (resultCard) {
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                scrollToVerifySection();
            }
        }

        function checkUrlForVerifyParam() {
            const params = new URLSearchParams(window.location.search);
            const serialFromUrl = (
                params.get("serial")
                || params.get("id")
                || params.get("verify")
                || ""
            ).trim();
            if (!serialFromUrl) return;

            const certId = sanitizeInput(serialFromUrl, { maxLength: 64 }).toUpperCase();
            const input = document.getElementById('certIdInput');
            if (input) input.value = certId;

            // Optional legacy query extras still supported if present.
            const nameParam = params.get('name');
            const fatherParam = params.get('father');
            const dobParam = params.get('dob');
            if (nameParam && document.getElementById('verifyStudentName')) {
                document.getElementById('verifyStudentName').value = nameParam;
            }
            if (dobParam && document.getElementById('verifyStudentDob')) {
                document.getElementById('verifyStudentDob').value = dobParam;
            }
            if (fatherParam && document.getElementById('verifyFatherName')) {
                document.getElementById('verifyFatherName').value = fatherParam;
            }

            scrollToVerifySection();

            const studentName = document.getElementById('verifyStudentName')?.value || "";
            const fatherName = document.getElementById('verifyFatherName')?.value || "";
            const studentDob = document.getElementById('verifyStudentDob')?.value || "";

            // Prefer full identity verify when all fields are present; otherwise
            // QR deep-link auto-verifies by serial alone.
            if (studentName && fatherName && studentDob) {
                verifyCertificate(certId, studentName, fatherName, studentDob, { silentToast: true });
            } else {
                verifyCertificate(certId, "", "", "", { serialOnly: true, silentToast: false });
            }
        }

        // =====================================================================
        // Admin Authentication & Secure Dashboard (FR-7.1 / FR-7.2)
        // =====================================================================

        let adminSessionUser = null;
        let adminCache = {
            students: [],
            courses: [],
            batches: [],
            certificates: [],
            leads: [],
            reviews: [],
            alumni: []
        };
        let filteredStudents = [];
        let csvImportState = {
            validRows: [],
            invalidRows: [],
            errorLines: [],
            warnings: []
        };
        let enrollmentChart = null;
        let courseDistChart = null;
        const csvNormalizedRowCache = new WeakMap();

        function escapeHtml(value) {
            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        /**
         * Strip HTML tags, script blocks, SQL fragments, and dangerous
         * bracket / control characters from public form fields before they
         * reach Supabase or Google Sheets.
         */
        function sanitizeInput(value, options = {}) {
            const {
                maxLength = 500,
                allowNewlines = false,
                preserveEmail = false
            } = options;

            let text = String(value ?? "");

            // Decode common entity smuggling, then strip tags / script blocks
            text = text
                .replace(/&lt;/gi, "<")
                .replace(/&gt;/gi, ">")
                .replace(/&#0*60;/gi, "<")
                .replace(/&#0*62;/gi, ">")
                .replace(/&#x0*3c;/gi, "<")
                .replace(/&#x0*3e;/gi, ">");
            text = text.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "");
            text = text.replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, "");
            text = text.replace(/<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi, "");
            text = text.replace(/<[^>]*>/g, "");

            // Drop null bytes and most C0/C1 control characters
            text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");

            if (!allowNewlines) {
                text = text.replace(/[\r\n]+/g, " ");
            } else {
                text = text.replace(/\r\n?/g, "\n");
            }

            // Neutralize leftover markup / template injection characters
            text = text.replace(/[<>`]/g, "");
            text = text.replace(/\{+|\}+/g, "");
            text = text.replace(/\[+|\]+/g, "");

            // Strip classic SQL injection fragments (defense-in-depth; RPC/params are primary)
            text = text.replace(/('--|\/\*|\*\/|;--)/g, " ");
            text = text.replace(/\b(union\s+select|select\s+.+\s+from|insert\s+into|update\s+\w+\s+set|delete\s+from|drop\s+(table|database|schema)|alter\s+table|exec(\s+|\()|execute\s+|xp_cmdshell|information_schema|pg_sleep|sleep\s*\(|benchmark\s*\()/gi, " ");
            text = text.replace(/\b(or|and)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/gi, " ");
            text = text.replace(/('|")\s*(or|and)\s*('|")?\d/gi, " ");

            if (!preserveEmail) {
                text = text.replace(/\bjavascript\s*:/gi, "");
                text = text.replace(/\bdata\s*:/gi, "");
                text = text.replace(/\bvbscript\s*:/gi, "");
                text = text.replace(/\bon\w+\s*=/gi, "");
            }

            text = text.replace(/\s{2,}/g, " ").trim();

            if (Number.isFinite(maxLength) && maxLength > 0 && text.length > maxLength) {
                text = text.slice(0, maxLength).trim();
            }
            return text;
        }

        function sanitizePhone(value) {
            return sanitizeInput(value, { maxLength: 30 })
                .replace(/[^\d+\-\s()]/g, "")
                .trim();
        }

        function sanitizePublicLeadPayload(payload) {
            const email = normalizeEmail(sanitizeInput(payload.email || "", {
                maxLength: 120,
                preserveEmail: true
            }));
            return {
                full_name: sanitizeInput(payload.full_name, { maxLength: 120 }),
                father_name: payload.father_name
                    ? sanitizeInput(payload.father_name, { maxLength: 120 })
                    : null,
                dob: payload.dob ? sanitizeInput(payload.dob, { maxLength: 10 }) : null,
                email,
                phone: payload.phone ? sanitizePhone(payload.phone) : null,
                course_id: payload.course_id || null,
                course_interest: payload.course_interest
                    ? sanitizeInput(payload.course_interest, { maxLength: 150 })
                    : null,
                message: payload.message
                    ? sanitizeInput(payload.message, { maxLength: 2000, allowNewlines: true })
                    : null,
                status: sanitizeInput(payload.status || "new", { maxLength: 32 }) || "new"
            };
        }

        function escapeJsString(value) {
            return String(value ?? "")
                .replace(/\\/g, "\\\\")
                .replace(/'/g, "\\'");
        }

        function formatDisplayDate(value) {
            if (!value) return "—";
            const formatted = formatDateOnlyDisplay(value);
            return formatted === "—" ? escapeHtml(String(value)) : formatted;
        }

        /** Parse a calendar date without UTC timezone shifting (YYYY-MM-DD safe). */
        function parseDateOnlyParts(value) {
            if (value === null || value === undefined || value === "") return null;
            if (value instanceof Date && !Number.isNaN(value.getTime())) {
                return {
                    y: value.getFullYear(),
                    m: value.getMonth() + 1,
                    d: value.getDate()
                };
            }
            const raw = String(value).trim();
            const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (iso) {
                return { y: Number(iso[1]), m: Number(iso[2]), d: Number(iso[3]) };
            }
            const slash = raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
            if (slash) {
                return { y: Number(slash[3]), m: Number(slash[2]), d: Number(slash[1]) };
            }
            // "15 Mar 2026" / "15 March 2026"
            const named = raw.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
            if (named) {
                const months = {
                    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
                    apr: 4, april: 4, may: 5, jun: 6, june: 6,
                    jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9, september: 9,
                    oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12
                };
                const m = months[named[2].toLowerCase()];
                if (m) return { y: Number(named[3]), m, d: Number(named[1]) };
            }
            return null;
        }

        function formatDateOnlyDisplay(value) {
            const parts = parseDateOnlyParts(value);
            if (!parts) return value ? String(value) : "—";
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = months[parts.m - 1] || "—";
            return `${String(parts.d).padStart(2, "0")} ${month} ${parts.y}`;
        }

        function toDateInputValue(value) {
            const parts = parseDateOnlyParts(value);
            if (!parts) return "";
            return `${parts.y}-${String(parts.m).padStart(2, "0")}-${String(parts.d).padStart(2, "0")}`;
        }

        function getLocalDateISO() {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        }

        function normalizeEmail(value) {
            return String(value || "").trim().toLowerCase();
        }

        function isValidEmail(value) {
            if (!value) return true;
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
        }

        function parseFlexibleDate(value) {
            if (value === null || value === undefined) return null;
            const raw = String(value).trim();
            if (!raw) return null;

            if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                const d = new Date(`${raw}T00:00:00`);
                return Number.isNaN(d.getTime()) ? null : raw;
            }

            const slash = raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
            if (slash) {
                const day = Number(slash[1]);
                const month = Number(slash[2]);
                const year = Number(slash[3]);
                if (month < 1 || month > 12 || day < 1 || day > 31) return null;
                const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const d = new Date(`${iso}T00:00:00`);
                return Number.isNaN(d.getTime()) ? null : iso;
            }

            const parsed = new Date(raw);
            if (Number.isNaN(parsed.getTime())) return null;
            return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
        }

        function getBatchLabel(batchId) {
            const batch = adminCache.batches.find((b) => b.id === batchId);
            if (!batch) return "—";
            return `${formatDisplayDate(batch.start_date)} · ${batch.schedule}`;
        }

        function requireSupabaseClient() {
            if (!supabaseClient) {
                showToast("⚠️ Supabase is not configured. Add your project URL and anon key in js/app.js.", "info");
                return false;
            }
            return true;
        }

        /**
         * Gate for all administrative console operations.
         * Requires an authenticated Supabase session (anon key + user JWT),
         * never a service_role key. Unauthenticated callers are forced out of
         * the management layout.
         */
        async function requireAdminSession() {
            if (!requireSupabaseClient()) {
                forcePublicShell();
                return false;
            }

            if (!adminSessionUser || !document.body.classList.contains("admin-session")) {
                showToast("⚠️ Admin authentication required.", "warning");
                forcePublicShell();
                if (getAppContext().isAdminDir) {
                    window.location.href = getAdminLoginHref();
                } else {
                    window.location.href = getAdminLoginHref();
                }
                return false;
            }

            try {
                const { data, error } = await supabaseClient.auth.getUser();
                if (error || !data?.user) {
                    console.warn("[Admin] Session verification failed:", error);
                    showToast("⚠️ Session expired. Please sign in again.", "warning");
                    forcePublicShell();
                    window.location.href = getAdminLoginHref();
                    return false;
                }
                adminSessionUser = data.user;
                return true;
            } catch (err) {
                console.error("[Admin] Session check error:", err);
                showToast("⚠️ Unable to verify admin session.", "warning");
                forcePublicShell();
                return false;
            }
        }

        /** Force the public marketing shell and hide the admin workspace. */
        function forcePublicShell() {
            adminSessionUser = null;
            adminCache = { students: [], courses: [], batches: [], certificates: [], leads: [], reviews: [], alumni: [] };
            filteredStudents = [];
            syncAuthChrome(false);
            const dashboard = document.getElementById("adminDashboard");
            if (dashboard) dashboard.hidden = true;
            if (window.location.hash && /admin/i.test(window.location.hash)) {
                history.replaceState(null, "", window.location.pathname + window.location.search);
            }
            const publicShell = document.getElementById("publicSiteShell");
            if (publicShell) {
                publicShell.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }

        /**
         * Defense-in-depth listeners for public forms: sanitize paste payloads
         * and block obvious script/SQL injection attempts before submit.
         */
        function initPublicSecurityHardening() {
            const publicSelectors = [
                "#admissionWizardForm input",
                "#admissionWizardForm textarea",
                "#publicInquiryForm input",
                "#publicInquiryForm textarea",
                "#studentAdmissionForm input",
                "#studentAdmissionForm textarea",
                "#studentAdmissionForm select",
                "#generalContactForm input",
                "#generalContactForm textarea",
                "#verifySecureForm input",
                "#callbackPhone"
            ].join(", ");

            document.querySelectorAll(publicSelectors).forEach((el) => {
                el.addEventListener("paste", (event) => {
                    const clip = event.clipboardData?.getData("text") || "";
                    if (!clip) return;
                    if (/<script|javascript:|union\s+select|drop\s+table/i.test(clip)) {
                        event.preventDefault();
                        showToast("⚠️ That paste contained disallowed content and was blocked.", "warning");
                    }
                });

                el.addEventListener("input", () => {
                    const raw = el.value || "";
                    if (/<\s*script|javascript\s*:|union\s+select/i.test(raw)) {
                        el.value = sanitizeInput(raw, {
                            maxLength: el.maxLength > 0 ? el.maxLength : 2000,
                            allowNewlines: el.tagName === "TEXTAREA",
                            preserveEmail: el.type === "email"
                        });
                    }
                });
            });

            // Tamper watch: if admin chrome is forced visible without a session, collapse it.
            if (!document.getElementById("adminDashboard")) return;
            setInterval(() => {
                const dashboard = document.getElementById("adminDashboard");
                const exposed = dashboard && !dashboard.hidden;
                const authed = Boolean(adminSessionUser) && document.body.classList.contains("admin-session");
                if (exposed && !authed) {
                    console.warn("[Security] Unauthenticated admin layout detected — forcing public shell.");
                    forcePublicShell();
                }
            }, 4000);
        }

        function openAdminLoginModal(options = {}) {
            if (document.body.classList.contains('admin-session')) return;

            const { fromSecret = false } = options;
            const modal = document.getElementById('adminLoginModal');
            const card = modal?.querySelector('.admin-login-card');
            const errorEl = document.getElementById('adminLoginError');
            if (errorEl) {
                errorEl.hidden = true;
                errorEl.textContent = "";
            }
            if (modal) {
                modal.classList.add('open');
                if (card) {
                    card.classList.remove('secret-reveal');
                    if (fromSecret) {
                        // Retrigger reveal animation on each secret open
                        void card.offsetWidth;
                        card.classList.add('secret-reveal');
                    }
                }
            }
            if (fromSecret) {
                showToast("Admin access ready — sign in to open the console.", "secret");
            }
            const emailInput = document.getElementById('adminEmail');
            if (emailInput) setTimeout(() => emailInput.focus(), 180);
        }

        function closeAdminLoginModal() {
            const modal = document.getElementById('adminLoginModal');
            const card = modal?.querySelector('.admin-login-card');
            if (card) card.classList.remove('secret-reveal');
            if (modal) modal.classList.remove('open');
        }

        function closeAdminLoginOnOverlay(event) {
            if (event.target.id === 'adminLoginModal') {
                closeAdminLoginModal();
            }
        }

        function setAdminLoginLoading(isLoading) {
            const btn = document.getElementById('adminLoginSubmitBtn');
            if (!btn) return;
            btn.disabled = isLoading;
            btn.textContent = isLoading ? "Signing in…" : "Sign In Securely";
        }

        function showAdminLoginError(message) {
            const errorEl = document.getElementById('adminLoginError');
            if (!errorEl) return;
            errorEl.hidden = false;
            errorEl.textContent = message;
        }

        async function handleAdminLogin(event) {
            event.preventDefault();
            if (!requireSupabaseClient()) return;

            const email = document.getElementById('adminEmail').value.trim();
            const password = document.getElementById('adminPassword').value;
            const errorEl = document.getElementById('adminLoginError');
            if (errorEl) {
                errorEl.hidden = true;
                errorEl.textContent = "";
            }

            if (!email || !password) {
                showAdminLoginError("Email and password are required.");
                return;
            }

            setAdminLoginLoading(true);
            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    showAdminLoginError(error.message || "Invalid credentials. Please try again.");
                    return;
                }

                adminSessionUser = data.user || data.session?.user || null;
                document.getElementById('adminLoginForm').reset();
                closeAdminLoginModal();
                showToast("✅ Admin signed in successfully.", "success");
                await enterAdminDashboard(adminSessionUser);
            } catch (err) {
                console.error('Admin login error:', err);
                showAdminLoginError("Unexpected login failure. Check your connection and try again.");
            } finally {
                setAdminLoginLoading(false);
            }
        }

        async function handleAdminLogout() {
            if (!supabaseClient) {
                exitAdminDashboard();
                return;
            }

            try {
                const { error } = await supabaseClient.auth.signOut();
                if (error) {
                    console.error('Admin logout error:', error);
                    showToast("⚠️ Signed out locally, but the session clear request failed.", "info");
                } else {
                    showToast("👋 Admin session ended.", "info");
                }
            } catch (err) {
                console.error('Unexpected logout error:', err);
            } finally {
                exitAdminDashboard();
            }
        }

        function syncAuthChrome(isAuthenticated, user = null) {
            const publicNav = document.getElementById('publicNavLinks');
            const adminNav = document.getElementById('adminNavLinks');
            const dashboard = document.getElementById('adminDashboard');
            const emailLabel = document.getElementById('adminNavEmail');

            if (isAuthenticated) {
                document.body.classList.add('admin-session');
                if (publicNav) publicNav.hidden = true;
                if (adminNav) adminNav.hidden = false;
                if (dashboard) dashboard.hidden = false;
                if (emailLabel) emailLabel.textContent = user?.email || "Administrator";
            } else {
                document.body.classList.remove('admin-session');
                if (publicNav) publicNav.hidden = false;
                if (adminNav) adminNav.hidden = true;
                if (dashboard) dashboard.hidden = true;
                if (emailLabel) emailLabel.textContent = "";
            }
        }

        function markAuthResolved() {
            document.body.classList.remove('auth-resolving');
        }

        function triggerSecretAdminAccess() {
            if (document.body.classList.contains('admin-session')) {
                showToast("You are already signed into the Admin Console.", "info");
                return;
            }
            window.location.href = getAdminLoginHref();
        }

        function bindSecretAdminTriggers() {
            const logo = document.getElementById('nav-logo');
            if (logo) {
                logo.addEventListener('dblclick', (event) => {
                    event.preventDefault();
                    triggerSecretAdminAccess();
                });
            }

            document.addEventListener('keydown', (event) => {
                if (event.ctrlKey && event.altKey && (event.key === 'a' || event.key === 'A')) {
                    event.preventDefault();
                    triggerSecretAdminAccess();
                }
            });
        }

        async function enterAdminDashboard(user) {
            if (window.__tsiAdminBootstrapped && adminSessionUser) {
                adminSessionUser = user || adminSessionUser;
                syncAuthChrome(true, adminSessionUser);
                markAuthResolved();
                return;
            }
            window.__tsiAdminBootstrapped = true;
            adminSessionUser = user || window.__tsiAdminUser || null;
            syncAuthChrome(true, adminSessionUser);
            markAuthResolved();
            if (!document.getElementById('adminDashboard')) return;
            switchAdminTab('students');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            await refreshAdminDashboard();
        }

        function exitAdminDashboard() {
            window.__tsiAdminBootstrapped = false;
            adminSessionUser = null;
            adminCache = { students: [], courses: [], batches: [], certificates: [], leads: [], reviews: [], alumni: [] };
            filteredStudents = [];
            syncAuthChrome(false);
            markAuthResolved();
            closeAdminLoginModal();
            closeCsvValidationModal();
            if (getAppContext().isAdminDir) {
                window.location.href = getAdminLoginHref();
            }
        }

        function switchAdminTab(tabName) {
            if (!document.getElementById('adminDashboard')) return;

            if (!adminSessionUser || !document.body.classList.contains("admin-session")) {
                forcePublicShell();
                window.location.href = getAdminLoginHref();
                return;
            }

            const buttons = document.querySelectorAll('.admin-tab-btn');
            buttons.forEach((btn) => {
                btn.classList.toggle('active', btn.getAttribute('data-admin-tab') === tabName);
            });

            const chips = document.querySelectorAll('.admin-nav-tab-chip');
            chips.forEach((chip) => {
                const label = (chip.textContent || "").trim().toLowerCase();
                const match =
                    (tabName === 'students' && label.startsWith('student')) ||
                    (tabName === 'courses' && label.startsWith('course')) ||
                    (tabName === 'certificates' && label.startsWith('cert')) ||
                    (tabName === 'leads' && label.startsWith('lead')) ||
                    (tabName === 'reviews' && label.startsWith('review')) ||
                    (tabName === 'alumni' && label.startsWith('alumni'));
                chip.classList.toggle('active', match);
            });

            const panels = document.querySelectorAll('.admin-panel');
            panels.forEach((panel) => {
                const isActive = panel.getAttribute('data-panel') === tabName;
                panel.hidden = !isActive;
                panel.classList.toggle('active', isActive);
                if (isActive) {
                    panel.classList.remove('anim-fade-in-up');
                    void panel.offsetWidth;
                    panel.classList.add('anim-fade-in-up');
                }
            });
            if (tabName === 'certificates' && !getEditingCertificateId()) setCertIdMode(true);
            if (tabName === 'leads') refreshAdminLeads();
            if (tabName === 'reviews') renderAdminReviewsTable();
            if (tabName === 'alumni') renderAdminAlumniTable();

            // Smooth-scroll the main dashboard panels into view after switching tabs
            requestAnimationFrame(() => {
                const contentArea = document.getElementById('admin-content-area');
                if (contentArea) {
                    contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }

        async function refreshAdminDashboard() {
            if (!(await requireAdminSession())) {
                renderAdminStats({ students: 0, courses: 0, issued: 0, revoked: 0 });
                return;
            }

            try {
                const [studentsRes, coursesRes, batchesRes, certsRes, leadsRes, reviewsRes, alumniRes] = await Promise.all([
                    supabaseClient
                        .from('students')
                        .select('id, full_name, father_name, dob, email, phone, course_id, batch_id, enrollment_date, status, is_archived, courses(name)')
                        .eq('is_archived', false)
                        .order('enrollment_date', { ascending: false }),
                    supabaseClient
                        .from('courses')
                        .select('id, name, category, description, duration, is_archived')
                        .order('name', { ascending: true }),
                    supabaseClient
                        .from('batches')
                        .select('id, course_id, start_date, schedule, instructor_name, capacity, is_archived, courses(name)')
                        .eq('is_archived', false)
                        .order('start_date', { ascending: false }),
                    supabaseClient
                        .from('certificates')
                        .select('id, certificate_id, student_id, course_id, student_name, father_name, course_name, issue_date, expiry_date, grade, status, student_dob, canvas_layout')
                        .order('issue_date', { ascending: false }),
                    supabaseClient
                        .from('leads')
                        .select('id, full_name, father_name, dob, email, phone, course_id, course_interest, message, status, created_at')
                        .order('created_at', { ascending: false }),
                    supabaseClient
                        .from('reviews')
                        .select('id, student_name, rating, review_text, is_approved, created_at')
                        .order('created_at', { ascending: false }),
                    supabaseClient
                        .from('alumni')
                        .select('id, student_name, batch_year, course_title, job_title, achievement_story, image_url, created_at')
                        .order('created_at', { ascending: false })
                ]);

                if (studentsRes.error) {
                    console.warn('Students father name load warning:', studentsRes.error);
                    const fallbackStudents = await supabaseClient
                        .from('students')
                        .select('id, full_name, dob, email, phone, course_id, batch_id, enrollment_date, status, is_archived, courses(name)')
                        .eq('is_archived', false)
                        .order('enrollment_date', { ascending: false });
                    if (fallbackStudents.error) throw studentsRes.error;
                    studentsRes.data = (fallbackStudents.data || []).map((student) => ({ ...student, father_name: null }));
                }
                if (coursesRes.error) throw coursesRes.error;
                if (batchesRes.error) throw batchesRes.error;
                if (certsRes.error) {
                    console.warn('Certificates load warning:', certsRes.error);
                    const fallbackCerts = await supabaseClient
                        .from('certificates')
                        .select('id, certificate_id, student_id, course_id, student_name, father_name, course_name, issue_date, grade, status')
                        .order('issue_date', { ascending: false });
                    if (fallbackCerts.error) throw certsRes.error;
                    adminCache.certificates = fallbackCerts.data || [];
                } else {
                    adminCache.certificates = certsRes.data || [];
                }

                adminCache.students = studentsRes.data || [];
                adminCache.courses = coursesRes.data || [];
                adminCache.batches = batchesRes.data || [];
                if (leadsRes.error) {
                    console.warn('Leads load warning:', leadsRes.error);
                    if (/father_name|dob|course_id|column/i.test(String(leadsRes.error.message || ""))) {
                        const legacyLeads = await supabaseClient
                            .from('leads')
                            .select('id, full_name, email, phone, course_interest, message, status, created_at')
                            .order('created_at', { ascending: false });
                        adminCache.leads = (legacyLeads.data || []).map((lead) => ({
                            ...lead,
                            father_name: null,
                            dob: null,
                            course_id: null
                        }));
                    } else {
                        adminCache.leads = [];
                    }
                } else {
                    adminCache.leads = leadsRes.data || [];
                }

                if (reviewsRes.error) {
                    console.warn("Reviews load warning:", reviewsRes.error);
                    adminCache.reviews = [];
                } else {
                    adminCache.reviews = reviewsRes.data || [];
                }
                if (alumniRes.error) {
                    console.warn("Alumni load warning:", alumniRes.error);
                    adminCache.alumni = [];
                } else {
                    adminCache.alumni = alumniRes.data || [];
                }

                const activeCourses = adminCache.courses.filter((c) => !c.is_archived).length;
                const issued = adminCache.certificates.filter((c) => (c.status || '').toLowerCase() === 'active').length;
                const revoked = adminCache.certificates.filter((c) => (c.status || '').toLowerCase() === 'revoked').length;

                renderAdminStats({
                    students: adminCache.students.length,
                    courses: activeCourses,
                    issued,
                    revoked
                });

                populateAdminCourseSelects();
                populateStudentFilterOptions();
                populateAdminStudentSelect();
                populateCertRenderSelect();
                applyStudentRosterFilters();
                renderAdminCoursesTable();
                renderAdminBatchesTable();
                renderAdminCertificatesTable();
                renderAdminLeadsTable();
                renderAdminReviewsTable();
                renderAdminAlumniTable();
                renderAdminAnalyticsCharts();
                if (!getEditingCertificateId()) setCertIdMode(true);
                else syncCertificateFormModeUI();
            } catch (err) {
                console.error('Admin dashboard refresh error:', err);
                showToast("⚠️ Could not load dashboard data. Confirm the relational schema is applied and RLS allows authenticated access.", "info");
            }
        }

        function renderAdminStats(stats) {
            const map = {
                statTotalStudents: stats.students,
                statActiveCourses: stats.courses,
                statCertsIssued: stats.issued,
                statCertsRevoked: stats.revoked
            };
            Object.entries(map).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = String(value ?? 0);
            });
        }

        function populateAdminCourseSelects() {
            const courseOptions = adminCache.courses
                .filter((c) => !c.is_archived)
                .map((c) => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)} (${escapeHtml(c.category)})</option>`)
                .join('');

            const studentCourse = document.getElementById('admStudentCourse');
            const batchCourse = document.getElementById('admBatchCourse');

            if (studentCourse) {
                const previous = studentCourse.value;
                studentCourse.innerHTML = `<option value="${NO_COURSE_YET_VALUE}">${NO_COURSE_YET_LABEL}</option>${courseOptions}`;
                if (previous && [...studentCourse.options].some((o) => o.value === previous)) {
                    studentCourse.value = previous;
                    populateAdminBatchOptions(previous === NO_COURSE_YET_VALUE ? "" : previous);
                } else {
                    studentCourse.value = NO_COURSE_YET_VALUE;
                    populateAdminBatchOptions("");
                }
            }

            if (batchCourse) {
                const previous = batchCourse.value;
                batchCourse.innerHTML = `<option value="" disabled selected>-- Select Course --</option>${courseOptions}`;
                if (previous && [...batchCourse.options].some((o) => o.value === previous)) {
                    batchCourse.value = previous;
                }
            }
        }

        function populateAdminBatchOptions(courseId, selectedBatchId = "") {
            const batchSelect = document.getElementById('admStudentBatch');
            if (!batchSelect) return;

            const effectiveCourseId = (!courseId || courseId === NO_COURSE_YET_VALUE) ? "" : courseId;
            const options = adminCache.batches
                .filter((b) => effectiveCourseId && b.course_id === effectiveCourseId)
                .map((b) => {
                    const label = `${formatDisplayDate(b.start_date)} · ${b.schedule}`;
                    return `<option value="${escapeHtml(b.id)}">${escapeHtml(label)}</option>`;
                })
                .join('');

            batchSelect.innerHTML = `<option value="">-- Optional --</option>${options}`;
            if (selectedBatchId && [...batchSelect.options].some((o) => o.value === selectedBatchId)) {
                batchSelect.value = selectedBatchId;
            }
        }

        function populateStudentFilterOptions() {
            const courseFilter = document.getElementById('filterStudentCourse');
            const batchFilter = document.getElementById('filterStudentBatch');
            if (!courseFilter || !batchFilter) return;

            const previousCourse = courseFilter.value;
            const previousBatch = batchFilter.value;

            const courseOptions = adminCache.courses
                .filter((c) => !c.is_archived)
                .map((c) => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`)
                .join('');
            courseFilter.innerHTML = `<option value="">All courses</option>${courseOptions}`;
            if (previousCourse && [...courseFilter.options].some((o) => o.value === previousCourse)) {
                courseFilter.value = previousCourse;
            }

            refreshFilterBatchOptions(courseFilter.value, previousBatch);
        }

        function refreshFilterBatchOptions(courseId, selectedBatchId = "") {
            const batchFilter = document.getElementById('filterStudentBatch');
            if (!batchFilter) return;

            const batches = adminCache.batches.filter((b) => !courseId || b.course_id === courseId);
            batchFilter.innerHTML = `<option value="">All batches</option>${batches.map((b) => {
                const courseName = b.courses?.name || "Course";
                return `<option value="${escapeHtml(b.id)}">${escapeHtml(courseName)} · ${escapeHtml(b.schedule)}</option>`;
            }).join('')}`;

            if (selectedBatchId && [...batchFilter.options].some((o) => o.value === selectedBatchId)) {
                batchFilter.value = selectedBatchId;
            }
        }

        function onStudentFilterCourseChange() {
            const courseId = document.getElementById('filterStudentCourse').value;
            refreshFilterBatchOptions(courseId);
            applyStudentRosterFilters();
        }

        function resetStudentRosterFilters() {
            const ids = ['studentSearchInput', 'filterStudentCourse', 'filterStudentBatch', 'filterStudentStatus', 'filterEnrollFrom', 'filterEnrollTo'];
            ids.forEach((id) => {
                const el = document.getElementById(id);
                if (el) el.value = "";
            });
            refreshFilterBatchOptions("");
            applyStudentRosterFilters();
        }

        function applyStudentRosterFilters() {
            const query = (document.getElementById('studentSearchInput')?.value || "").trim().toLowerCase();
            const courseId = document.getElementById('filterStudentCourse')?.value || "";
            const batchId = document.getElementById('filterStudentBatch')?.value || "";
            const status = document.getElementById('filterStudentStatus')?.value || "";
            const fromDate = document.getElementById('filterEnrollFrom')?.value || "";
            const toDate = document.getElementById('filterEnrollTo')?.value || "";

            filteredStudents = adminCache.students.filter((student) => {
                if (courseId && student.course_id !== courseId) return false;
                if (batchId && student.batch_id !== batchId) return false;
                if (status && (student.status || "").toLowerCase() !== status) return false;

                if (fromDate && student.enrollment_date && student.enrollment_date < fromDate) return false;
                if (toDate && student.enrollment_date && student.enrollment_date > toDate) return false;

                if (query) {
                    const haystack = [
                        student.full_name,
                        student.email,
                        student.phone,
                        student.courses?.name
                    ].join(" ").toLowerCase();
                    if (!haystack.includes(query)) return false;
                }

                return true;
            });

            const countEl = document.getElementById('studentRosterCount');
            if (countEl) {
                countEl.textContent = `${filteredStudents.length} student${filteredStudents.length === 1 ? "" : "s"} shown`;
            }

            renderAdminStudentsTable();
        }

        function populateAdminStudentSelect() {
            const studentSelect = document.getElementById('admCertStudent');
            if (!studentSelect) return;

            const previous = studentSelect.value;
            const options = adminCache.students
                .map((s) => {
                    const courseName = s.courses?.name || "Unassigned course";
                    return `<option value="${escapeHtml(s.id)}">${escapeHtml(s.full_name)} — ${escapeHtml(courseName)}</option>`;
                })
                .join('');

            studentSelect.innerHTML = `<option value="" disabled selected>-- Select Student --</option>${options}`;
            if (previous && [...studentSelect.options].some((o) => o.value === previous)) {
                studentSelect.value = previous;
            }
            studentSelect.onchange = onCertStudentSelected;
        }

        function renderAdminStudentsTable() {
            const body = document.getElementById('adminStudentsBody');
            if (!body) return;

            if (!filteredStudents.length) {
                body.innerHTML = `<tr><td colspan="6" class="admin-table-empty">No students match the current filters.</td></tr>`;
                return;
            }

            body.innerHTML = filteredStudents.map((student) => {
                const courseName = student.courses?.name || "—";
                const status = (student.status || "active").toLowerCase();
                const safeId = escapeJsString(student.id);
                return `
                    <tr>
                        <td><strong>${escapeHtml(student.full_name)}</strong></td>
                        <td>
                            ${escapeHtml(courseName)}
                            <div class="student-cell-sub">${escapeHtml(getBatchLabel(student.batch_id))}</div>
                        </td>
                        <td>
                            ${escapeHtml(student.phone || "—")}
                            <div class="student-cell-sub">${escapeHtml(student.email || "")}</div>
                        </td>
                        <td><span class="admin-status-pill ${escapeHtml(status)}">${escapeHtml(status)}</span></td>
                        <td>${formatDisplayDate(student.enrollment_date)}</td>
                        <td>
                            <button type="button" class="admin-action-btn" onclick="startEditStudent('${safeId}')">Edit</button>
                            <button type="button" class="admin-action-btn danger" onclick="handleAdminArchiveStudent('${safeId}')">Archive</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function toggleStudentEntryForm(forceOpen = null) {
            const form = document.getElementById('adminStudentForm');
            if (!form) return;
            const shouldOpen = forceOpen === null ? form.hidden : forceOpen;
            form.hidden = !shouldOpen;
            const btn = document.getElementById('toggleStudentFormBtn');
            if (btn && forceOpen !== false) {
                btn.textContent = form.hidden ? "+ Add Student" : "Hide Form";
            }
            if (shouldOpen && !document.getElementById('admStudentId').value) {
                prepareCreateStudentForm();
            }
        }

        function prepareCreateStudentForm() {
            const form = document.getElementById('adminStudentForm');
            if (!form) return;
            form.reset();
            document.getElementById('admStudentId').value = "";
            document.getElementById('studentFormBanner').textContent = "Manual student entry";
            document.getElementById('admStudentSubmitBtn').textContent = "Save Student";
            document.getElementById('admStudentEnrollDate').value = getLocalDateISO();
            document.getElementById('admStudentStatus').value = "active";
            populateAdminCourseSelects();
        }

        function cancelStudentEntryForm() {
            prepareCreateStudentForm();
            toggleStudentEntryForm(false);
            const btn = document.getElementById('toggleStudentFormBtn');
            if (btn) btn.textContent = "+ Add Student";
        }

        function startEditStudent(studentId) {
            const student = adminCache.students.find((s) => s.id === studentId);
            if (!student) {
                showToast("⚠️ Student not found.", "info");
                return;
            }

            toggleStudentEntryForm(true);
            document.getElementById('admStudentId').value = student.id;
            document.getElementById('studentFormBanner').textContent = `Editing · ${student.full_name}`;
            document.getElementById('admStudentSubmitBtn').textContent = "Update Student";
            document.getElementById('admStudentName').value = student.full_name || "";
            document.getElementById('admStudentFather').value = student.father_name || "";
            document.getElementById('admStudentDob').value = student.dob || "";
            document.getElementById('admStudentEmail').value = student.email || "";
            document.getElementById('admStudentPhone').value = student.phone || "";
            document.getElementById('admStudentStatus').value = student.status || "active";
            document.getElementById('admStudentEnrollDate').value = toDateInputValue(student.enrollment_date) || getLocalDateISO();

            populateAdminCourseSelects();
            const courseSelect = document.getElementById('admStudentCourse');
            if (courseSelect) {
                courseSelect.value = student.course_id || NO_COURSE_YET_VALUE;
            }
            populateAdminBatchOptions(student.course_id || "", student.batch_id || "");

            document.getElementById('adminStudentForm').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function resolveStudentCourseLabel(courseId) {
            if (!courseId || courseId === NO_COURSE_YET_VALUE) return NO_COURSE_YET_LABEL;
            const course = adminCache.courses.find((c) => c.id === courseId);
            return course?.name || NO_COURSE_YET_LABEL;
        }

        /** Fire-and-forget Google Sheet sync — never blocks Supabase enrollment. */
        function syncStudentToGoogleSheet({
            studentName,
            fatherName,
            dob,
            email,
            contact,
            course,
            courseStatus,
            enrollmentDate
        }) {
            if (!GOOGLE_SHEET_WEBAPP_URL) return;
            const sheetPayload = {
                studentName: sanitizeInput(studentName, { maxLength: 120 }),
                fatherName: sanitizeInput(fatherName, { maxLength: 120 }),
                dob: sanitizeInput(dob, { maxLength: 10 }),
                email: normalizeEmail(sanitizeInput(email, { maxLength: 120, preserveEmail: true })),
                contact: sanitizePhone(contact),
                course: sanitizeInput(course || NO_COURSE_YET_LABEL, { maxLength: 150 }),
                courseStatus: sanitizeInput(courseStatus || "active", { maxLength: 32 }),
                enrollmentDate: sanitizeInput(enrollmentDate || getLocalDateISO(), { maxLength: 10 })
            };
            console.log("[Google Sheet] Syncing student:", sheetPayload);
            fetch(GOOGLE_SHEET_WEBAPP_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(sheetPayload)
            }).then(() => {
                console.log("[Google Sheet] Sync request dispatched.");
            }).catch((err) => {
                console.warn("[Google Sheet] Sync failed (non-blocking):", err);
            });
        }

        async function handleAdminSaveStudent(event) {
            event.preventDefault();
            if (!(await requireAdminSession())) return;

            const editingId = document.getElementById('admStudentId').value.trim();
            const emailValue = document.getElementById('admStudentEmail').value.trim();
            if (emailValue && !isValidEmail(emailValue)) {
                showToast("⚠️ Please enter a valid email address.", "info");
                return;
            }

            const courseSelectValue = document.getElementById('admStudentCourse').value;
            const courseId = (!courseSelectValue || courseSelectValue === NO_COURSE_YET_VALUE)
                ? null
                : courseSelectValue;

            const payload = {
                full_name: document.getElementById('admStudentName').value.trim(),
                father_name: document.getElementById('admStudentFather').value.trim() || null,
                dob: document.getElementById('admStudentDob').value,
                email: emailValue || null,
                phone: document.getElementById('admStudentPhone').value.trim() || null,
                course_id: courseId,
                batch_id: courseId ? (document.getElementById('admStudentBatch').value || null) : null,
                status: document.getElementById('admStudentStatus').value,
                enrollment_date: document.getElementById('admStudentEnrollDate').value,
                is_archived: false
            };

            if (!payload.full_name || !payload.father_name || !payload.dob || !payload.enrollment_date) {
                showToast("⚠️ Name, father's name, DOB, and enrollment date are required.", "info");
                return;
            }
            if (!courseSelectValue) {
                showToast("⚠️ Please select a course (or choose No course yet).", "info");
                return;
            }

            let error;
            if (editingId) {
                ({ error } = await supabaseClient.from('students').update(payload).eq('id', editingId));
            } else {
                ({ error } = await supabaseClient.from('students').insert(payload));
            }

            if (error && String(error.message || "").toLowerCase().includes("father_name")) {
                delete payload.father_name;
                if (editingId) {
                    ({ error } = await supabaseClient.from('students').update(payload).eq('id', editingId));
                } else {
                    ({ error } = await supabaseClient.from('students').insert(payload));
                }
                if (!error) {
                    showToast("⚠️ Student saved, but run feature_upgrade_leads_expiry_father.sql to store father's name.", "info");
                }
            }

            // Retry with a placeholder course only if DB still requires course_id NOT NULL
            if (error && !courseId && /course_id|null value/i.test(String(error.message || ""))) {
                console.warn("[Students] course_id is NOT NULL in schema — retrying requires a real course. Error:", error);
                showToast("⚠️ Database still requires a course. Pick a course, or run: ALTER TABLE students ALTER COLUMN course_id DROP NOT NULL;", "info");
                return;
            }

            if (error) {
                console.error("[Students] Save error:", error);
                showToast(`⚠️ Could not save student: ${error.message}`, "info");
                return;
            }

            // Background Google Sheet sync (new enrollments and updates)
            syncStudentToGoogleSheet({
                studentName: payload.full_name,
                fatherName: payload.father_name || "",
                dob: payload.dob,
                email: payload.email || "",
                contact: payload.phone || "",
                course: resolveStudentCourseLabel(courseId),
                courseStatus: payload.status || "active",
                enrollmentDate: payload.enrollment_date
            });

            showToast(editingId ? "✅ Student updated." : "✅ Student enrolled successfully.", "success");
            await logAdminActivity(editingId ? 'student_updated' : 'student_created', 'students', {
                full_name: payload.full_name,
                course_id: payload.course_id,
                id: editingId || null
            });
            cancelStudentEntryForm();
            await refreshAdminDashboard();
        }

        // ---------------- CSV Bulk Import (FR-2.3 to FR-2.5) ----------------

        function downloadStudentCsvTemplate(event) {
            event.preventDefault();
            const csv = [
                "full_name,father_name,dob,email,phone,course_name,batch_schedule,status,enrollment_date",
                "Ali Khan,Ahmed Khan,2002-05-14,ali@example.com,03001234567,AI Engineering,Mon–Fri · Evening · 5:00–7:00 PM,active,2026-03-01"
            ].join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "tsi_students_template.csv";
            a.click();
            URL.revokeObjectURL(url);
        }

        function normalizeCsvKey(key) {
            return String(key || "")
                .replace(/^\uFEFF/, "")
                .replace(/\r/g, "")
                .replace(/["']/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9 ]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        }

        function getCsvField(row, aliases) {
            const canCache = row && typeof row === "object";
            let normalizedRow = canCache ? csvNormalizedRowCache.get(row) : null;
            if (!normalizedRow) {
                normalizedRow = Object.entries(row || {}).reduce((fields, [key, value]) => {
                    fields[normalizeCsvKey(key)] = String(value ?? "")
                        .replace(/\r/g, "")
                        .replace(/^["']|["']$/g, "")
                        .trim();
                    return fields;
                }, {});
                if (canCache) csvNormalizedRowCache.set(row, normalizedRow);
            }
            for (const alias of aliases) {
                const value = normalizedRow[normalizeCsvKey(alias)];
                if (value) return value;
            }
            return "";
        }

        function resolveCourseIdByName(courseName) {
            const needle = courseName.trim().toLowerCase();
            const match = adminCache.courses.find((c) => !c.is_archived && c.name.trim().toLowerCase() === needle);
            return match ? match.id : null;
        }

        function resolveBatchId(courseId, batchHint) {
            if (!batchHint) return null;
            const needle = batchHint.trim().toLowerCase();
            const match = adminCache.batches.find((b) => {
                if (b.course_id !== courseId) return false;
                const label = `${b.schedule} ${b.instructor_name} ${b.start_date}`.toLowerCase();
                return b.schedule.toLowerCase() === needle || label.includes(needle);
            });
            return match ? match.id : null;
        }

        async function handleStudentCsvSelected(event) {
            const file = event.target.files?.[0];
            const uploadLabel = event.target.closest('label') || document.querySelector('.csv-upload-btn');
            event.target.value = "";
            if (!file) return;
            if (!(await requireAdminSession())) return;

            if (typeof Papa === "undefined") {
                showToast("⚠️ PapaParse failed to load. Check your network and refresh.", "warning");
                return;
            }

            showToast('<span class="loading-inline"><span class="micro-spinner" aria-hidden="true"></span> Validating CSV rows…</span>', "info");
            if (uploadLabel) uploadLabel.classList.add('is-loading');

            const csvBody = document.querySelector('#csvValidationModal .csv-validation-body');
            if (csvBody) csvBody.classList.add('is-validating');

            Papa.parse(file, {
                header: true,
                skipEmptyLines: "greedy",
                transformHeader: (h) => String(h || '').replace(/^\uFEFF/, '').replace(/["']/g, '').trim(),
                transform: (v) => String(v ?? '').replace(/\r/g, '').replace(/^["']|["']$/g, '').trim(),
                complete: async (results) => {
                    try {
                        await validateStudentCsvRows(results.data || []);
                    } finally {
                        if (csvBody) csvBody.classList.remove('is-validating');
                        if (uploadLabel) uploadLabel.classList.remove('is-loading');
                    }
                },
                error: (err) => {
                    console.error(err);
                    if (csvBody) csvBody.classList.remove('is-validating');
                    if (uploadLabel) uploadLabel.classList.remove('is-loading');
                    showToast("⚠️ Unable to parse CSV file.", "warning");
                }
            });
        }

        async function validateStudentCsvRows(rows) {
            const existingEmails = new Set(
                adminCache.students
                    .map((s) => normalizeEmail(s.email))
                    .filter(Boolean)
            );
            const seenInFile = new Set();
            const validRows = [];
            const invalidRows = [];
            const errorLines = [];
            const softWarnings = [];

            rows.forEach((row, index) => {
                const rowNumber = index + 2; // header is row 1
                const fullName = getCsvField(row, ["full name", "fullname", "name", "student name", "student_name", "full_name"]);
                const fatherName = getCsvField(row, ["father name", "fathername", "fathers name", "father's name", "father_name"]);
                const dobRaw = getCsvField(row, ["date of birth", "dob", "birth date", "birthdate", "date_of_birth"]);
                const emailRaw = getCsvField(row, ["email", "student email", "student_email", "email address"]);
                const phone = getCsvField(row, ["phone", "mobile", "whatsapp", "phone number", "contact"]);
                const courseName = getCsvField(row, ["course name", "course_name", "course", "track"]);
                const batchHint = getCsvField(row, ["batch schedule", "batch_schedule", "batch", "schedule"]);
                const statusRaw = (getCsvField(row, ["status", "student status"]) || "active").toLowerCase();
                const enrollRaw = getCsvField(row, ["enrollment date", "enrollment_date", "enrolled on", "enrolled_on", "enroll date", "enroll_date"]);

                const errors = [];

                if (!fullName || fullName.length < 3) {
                    errors.push("Full name is required (min 3 characters).");
                }
                if (!fatherName || fatherName.length < 3) {
                    errors.push("Father's name is required (min 3 characters).");
                }

                const dob = parseFlexibleDate(dobRaw);
                if (!dob) {
                    errors.push("DOB is required and must be a valid date (YYYY-MM-DD or DD/MM/YYYY).");
                }

                if (emailRaw && !isValidEmail(emailRaw)) {
                    errors.push("Email format is invalid.");
                }

                const email = normalizeEmail(emailRaw);
                if (email && existingEmails.has(email)) {
                    errors.push("Email already exists in the database.");
                }
                if (email && seenInFile.has(email)) {
                    errors.push("Duplicate email within the CSV file.");
                }

                const courseId = resolveCourseIdByName(courseName);
                if (!courseName) {
                    errors.push("Course name is required.");
                } else if (!courseId) {
                    errors.push(`Course "${courseName}" was not found in active courses.`);
                }

                let batchId = null;
                if (batchHint && courseId) {
                    batchId = resolveBatchId(courseId, batchHint);
                    if (!batchId) {
                        const warning = `Row ${rowNumber}: Warning — batch "${batchHint}" not found; imported without batch.`;
                        softWarnings.push(warning);
                        errorLines.push(warning);
                    }
                }

                if (!["active", "completed", "dropped"].includes(statusRaw)) {
                    errors.push("Status must be one of: active, completed, dropped.");
                }

                const enrollmentDate = parseFlexibleDate(enrollRaw) || getLocalDateISO();

                if (errors.length) {
                    invalidRows.push({ rowNumber, fullName, errors });
                    errorLines.push(`Row ${rowNumber}: ${errors.join(" | ")}`);
                    return;
                }

                if (email) seenInFile.add(email);

                validRows.push({
                    full_name: fullName,
                    father_name: fatherName,
                    dob,
                    email: email || null,
                    phone: phone || null,
                    course_id: courseId,
                    batch_id: batchId,
                    status: statusRaw,
                    enrollment_date: enrollmentDate,
                    is_archived: false
                });
            });

            csvImportState = { validRows, invalidRows, errorLines, warnings: softWarnings };
            openCsvValidationModal(rows.length, validRows.length, invalidRows.length);
        }

        function openCsvValidationModal(total, valid, invalid) {
            document.getElementById('csvStatTotal').textContent = String(total);
            document.getElementById('csvStatValid').textContent = String(valid);
            document.getElementById('csvStatInvalid').textContent = String(invalid);

            const note = document.getElementById('csvSummaryNote');
            const preview = document.getElementById('csvErrorPreview');
            const confirmBtn = document.getElementById('csvConfirmImportBtn');

            const warningCount = csvImportState.warnings?.length || 0;
            if (invalid > 0) {
                note.textContent = `${invalid} row(s) failed validation. Download the error log, fix the file, and re-upload. You can still import the ${valid} valid row(s).${warningCount ? ` ${warningCount} row(s) will be imported without a batch.` : ''}`;
                preview.hidden = false;
                preview.textContent = csvImportState.errorLines.slice(0, 12).join("\n") + (csvImportState.errorLines.length > 12 ? "\n…" : "");
            } else if (warningCount > 0) {
                note.textContent = `All ${valid} rows passed validation. ${warningCount} row(s) will be imported without a batch.`;
                preview.hidden = false;
                preview.textContent = csvImportState.warnings.slice(0, 12).join("\n") + (warningCount > 12 ? "\n…" : "");
            } else {
                note.textContent = "All rows passed validation. Confirm to insert them into Supabase.";
                preview.hidden = true;
                preview.textContent = "";
            }

            confirmBtn.disabled = valid === 0;
            confirmBtn.textContent = valid === 0 ? "No Valid Rows" : `Confirm Import (${valid})`;
            document.getElementById('csvValidationModal').classList.add('open');
        }

        function closeCsvValidationModal() {
            const modal = document.getElementById('csvValidationModal');
            if (modal) modal.classList.remove('open');
        }

        function closeCsvValidationOnOverlay(event) {
            if (event.target.id === 'csvValidationModal') closeCsvValidationModal();
        }

        function downloadCsvErrorLog() {
            if (!csvImportState.errorLines.length) {
                showToast("ℹ️ There are no validation errors to download.", "info");
                return;
            }

            const content = [
                "Spectrum Institute — Student CSV Validation Error Log",
                `Generated: ${new Date().toISOString()}`,
                "",
                ...csvImportState.errorLines
            ].join("\n");

            const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "tsi_student_csv_errors.txt";
            a.click();
            URL.revokeObjectURL(url);
        }

        async function confirmStudentCsvImport() {
            if (!(await requireAdminSession())) return;
            if (!csvImportState.validRows.length) {
                showToast("⚠️ No valid rows available to import.", "info");
                return;
            }

            const confirmBtn = document.getElementById('csvConfirmImportBtn');
            confirmBtn.disabled = true;
            confirmBtn.textContent = "Importing…";

            let { data, error } = await supabaseClient
                .from('students')
                .insert(csvImportState.validRows)
                .select('id');

            if (error && String(error.message || "").toLowerCase().includes("father_name")) {
                const stripped = csvImportState.validRows.map(({ father_name, ...rest }) => rest);
                ({ data, error } = await supabaseClient.from('students').insert(stripped).select('id'));
                if (!error) {
                    showToast("⚠️ Imported without father's name — run feature_upgrade_leads_expiry_father.sql.", "info");
                }
            }

            if (error) {
                console.error(error);
                showToast(`⚠️ Import failed: ${error.message}`, "info");
                confirmBtn.disabled = false;
                confirmBtn.textContent = `Confirm Import (${csvImportState.validRows.length})`;
                return;
            }

            await logAdminActivity('students_csv_imported', 'students', {
                inserted: data?.length || csvImportState.validRows.length,
                invalid: csvImportState.invalidRows.length
            });

            showToast(`✅ Imported ${data?.length || csvImportState.validRows.length} student(s).`, "success");

            // Background Google Sheet sync for each imported row (non-blocking)
            csvImportState.validRows.forEach((row) => {
                syncStudentToGoogleSheet({
                    studentName: row.full_name,
                    fatherName: row.father_name || "",
                    dob: row.dob,
                    email: row.email || "",
                    contact: row.phone || "",
                    course: resolveStudentCourseLabel(row.course_id),
                    courseStatus: row.status || "active",
                    enrollmentDate: row.enrollment_date
                });
            });

            closeCsvValidationModal();
            csvImportState = { validRows: [], invalidRows: [], errorLines: [], warnings: [] };
            await refreshAdminDashboard();
        }

        function renderAdminCoursesTable() {
            const body = document.getElementById('adminCoursesBody');
            if (!body) return;

            if (!adminCache.courses.length) {
                body.innerHTML = `<tr><td colspan="5" class="admin-table-empty">No courses found.</td></tr>`;
                return;
            }

            body.innerHTML = adminCache.courses.map((course) => {
                const archived = !!course.is_archived;
                return `
                    <tr>
                        <td>${escapeHtml(course.name)}</td>
                        <td>${escapeHtml(course.category)}</td>
                        <td>${escapeHtml(course.duration || "—")}</td>
                        <td>
                            <span class="admin-status-pill ${archived ? 'archived' : 'active'}">
                                ${archived ? 'Yes' : 'No'}
                            </span>
                        </td>
                        <td>
                            <button type="button" class="admin-action-btn" onclick="handleAdminToggleCourseArchive('${escapeHtml(course.id)}', ${archived})">
                                ${archived ? 'Restore' : 'Archive'}
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function renderAdminBatchesTable() {
            const body = document.getElementById('adminBatchesBody');
            if (!body) return;

            if (!adminCache.batches.length) {
                body.innerHTML = `<tr><td colspan="6" class="admin-table-empty">No batches found.</td></tr>`;
                return;
            }

            body.innerHTML = adminCache.batches.map((batch) => {
                const courseName = batch.courses?.name || "—";
                return `
                    <tr>
                        <td>${escapeHtml(courseName)}</td>
                        <td>${formatDisplayDate(batch.start_date)}</td>
                        <td>${escapeHtml(batch.schedule)}</td>
                        <td>${escapeHtml(batch.instructor_name)}</td>
                        <td>${escapeHtml(batch.capacity)}</td>
                        <td>
                            <button type="button" class="admin-action-btn danger" onclick="handleAdminArchiveBatch('${escapeHtml(batch.id)}')">Archive</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        let selectedCertRenderId = null;
        /** UUID primary key of the certificate currently being edited (null = create mode). */
        let editingCertificateId = null;

        function getEditingCertificateId() {
            const hidden = document.getElementById("editingCertificateId");
            const fromHidden = hidden?.value?.trim() || "";
            return fromHidden || editingCertificateId || null;
        }

        function setEditingCertificateId(id) {
            editingCertificateId = id || null;
            const hidden = document.getElementById("editingCertificateId");
            if (hidden) hidden.value = editingCertificateId || "";
            syncCertificateFormModeUI();
        }

        function syncCertificateFormModeUI() {
            const isEdit = Boolean(getEditingCertificateId());
            const banner = document.getElementById("certFormModeBanner");
            const submitBtn = document.getElementById("admCertSubmitBtn");
            const cancelBtn = document.getElementById("cancelCertEditBtn");
            const newBtn = document.getElementById("newCertificateBtn");
            const modeBtn = document.getElementById("admCertIdModeBtn");
            const idInput = document.getElementById("admCertId");

            if (banner) {
                banner.textContent = isEdit
                    ? "Edit mode — saving will overwrite this certificate (same Serial / Certificate ID)."
                    : "Create mode — issuing a new certificate.";
            }
            if (submitBtn) submitBtn.textContent = isEdit ? "Update Certificate" : "Issue Certificate";
            if (cancelBtn) cancelBtn.hidden = !isEdit;
            if (newBtn) newBtn.hidden = !isEdit;
            if (modeBtn) modeBtn.disabled = isEdit;
            if (idInput && isEdit) idInput.readOnly = true;
        }

        function resetCertificateForm() {
            const form = document.getElementById("adminCertificateForm");
            const assocSnapshot = document.getElementById("admCertAssociation")?.value ?? "";
            if (form) form.reset();
            setEditingCertificateId(null);
            selectedCertRenderId = null;
            certEditStateCertId = null;
            const assocInput = document.getElementById("admCertAssociation");
            if (assocInput) assocInput.value = assocSnapshot;
            const issueDateInput = document.getElementById("admCertIssueDate");
            if (issueDateInput) issueDateInput.value = getLocalDateISO();
            const modeBtn = document.getElementById("admCertIdModeBtn");
            if (modeBtn) modeBtn.disabled = false;
            setCertIdMode(true);
            syncCertificateFormModeUI();
        }

        function beginEditCertificate(certRowId) {
            const cert = adminCache.certificates.find((c) => c.id === certRowId);
            if (!cert) {
                showToast("⚠️ Certificate not found in the current roster.", "warning");
                return;
            }

            switchAdminTab("certificates");
            setEditingCertificateId(cert.id);
            selectedCertRenderId = cert.id;
            certEditStateCertId = null;

            const idInput = document.getElementById("admCertId");
            if (idInput) {
                idInput.value = String(cert.certificate_id || "").toUpperCase();
                idInput.readOnly = true;
            }
            certIdAutoMode = false;
            const modeBtn = document.getElementById("admCertIdModeBtn");
            if (modeBtn) {
                modeBtn.textContent = "Locked (Edit)";
                modeBtn.classList.remove("is-auto");
                modeBtn.classList.add("is-manual");
                modeBtn.disabled = true;
            }
            const modeHint = document.getElementById("admCertIdHint");
            if (modeHint) {
                modeHint.textContent = "Serial number is preserved while editing. Save updates the existing record.";
            }

            const studentSelect = document.getElementById("admCertStudent");
            if (studentSelect && cert.student_id) studentSelect.value = cert.student_id;

            const fatherInput = document.getElementById("admCertFather");
            if (fatherInput) fatherInput.value = cert.father_name || "";

            const issueInput = document.getElementById("admCertIssueDate");
            if (issueInput) issueInput.value = toDateInputValue(cert.issue_date) || getLocalDateISO();

            const expiryInput = document.getElementById("admCertExpiry");
            if (expiryInput) expiryInput.value = toDateInputValue(cert.expiry_date) || "";

            const gradeInput = document.getElementById("admCertGrade");
            if (gradeInput) gradeInput.value = cert.grade || "";

            const dupHint = document.getElementById("admCertIdDupHint");
            if (dupHint) {
                dupHint.hidden = true;
                dupHint.textContent = "";
            }

            syncCertificateFormModeUI();
            document.getElementById("adminCertificateForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
            showToast(`Editing ${cert.certificate_id} — save to overwrite this record.`, "info");
        }

        function populateCertRenderSelect() {
            // Kept for dashboard refresh compatibility — render target is now
            // resolved from the student dropdown + selectedCertRenderId.
            if (!selectedCertRenderId) return;
            const stillExists = adminCache.certificates.some((c) => c.id === selectedCertRenderId);
            if (!stillExists) selectedCertRenderId = null;
        }

        function onCertStudentSelected() {
            if (getEditingCertificateId()) return;
            const studentSelect = document.getElementById('admCertStudent');
            const student = adminCache.students.find((s) => s.id === studentSelect?.value);
            const fatherInput = document.getElementById('admCertFather');
            if (fatherInput && student?.father_name) {
                fatherInput.value = student.father_name;
            }
            if (!student) return;
            const latest = adminCache.certificates
                .filter((c) => c.student_id === student.id && (c.status || '').toLowerCase() === 'active')
                .sort((a, b) => String(b.issue_date || '').localeCompare(String(a.issue_date || '')))[0];
            if (latest) selectedCertRenderId = latest.id;
        }

        function renderAdminCertificatesTable() {
            const body = document.getElementById('adminCertificatesBody');
            if (!body) return;

            if (!adminCache.certificates.length) {
                body.innerHTML = `<tr><td colspan="8" class="admin-table-empty">No certificates issued yet.</td></tr>`;
                return;
            }

            body.innerHTML = adminCache.certificates.map((cert) => {
                const status = (cert.status || "active").toLowerCase();
                const canRevoke = status === "active";
                const expired = canRevoke && cert.expiry_date && String(cert.expiry_date).slice(0, 10) < getTodayDateKey();
                const displayStatus = expired ? "expired" : status;
                const safeId = escapeJsString(cert.id);
                return `
                    <tr>
                        <td>${escapeHtml(cert.certificate_id)}</td>
                        <td>${escapeHtml(cert.student_name)}</td>
                        <td>${escapeHtml(cert.course_name)}</td>
                        <td>${formatDisplayDate(cert.issue_date)}</td>
                        <td>${formatDisplayDate(cert.expiry_date)}</td>
                        <td>${escapeHtml(cert.grade || "—")}</td>
                        <td><span class="admin-status-pill ${escapeHtml(displayStatus)}">${escapeHtml(displayStatus)}</span></td>
                        <td>
                            <button type="button" class="admin-action-btn" onclick="beginEditCertificate('${safeId}')">Edit</button>
                            <button type="button" class="admin-action-btn" onclick="prepareCertificateRender('${safeId}')">Preview</button>
                            ${canRevoke
                                ? `<button type="button" class="admin-action-btn danger" onclick="handleAdminRevokeCertificate('${safeId}')">Revoke</button>`
                                : `<button type="button" class="admin-action-btn" onclick="handleAdminRestoreCertificate('${safeId}')">Restore</button>`
                            }
                        </td>
                    </tr>
                `;
            }).join('');
        }

        function previewNextCertificateId() {
            const year = new Date().getFullYear();
            const prefix = `TSI-${year}-`;
            const seqs = adminCache.certificates
                .map((c) => String(c.certificate_id || '').toUpperCase())
                .filter((id) => id.startsWith(prefix))
                .map((id) => parseInt(id.slice(prefix.length), 10))
                .filter((n) => Number.isFinite(n));
            const next = (seqs.length ? Math.max(...seqs) : 0) + 1;
            const fallback = adminCache.certificates.length + 1;
            const use = seqs.length ? next : fallback;
            return `${prefix}${String(use).padStart(3, '0')}`;
        }

        let certIdAutoMode = true;

        function isCertIdAutoMode() {
            return certIdAutoMode;
        }

        function setCertIdMode(autoEnabled) {
            if (getEditingCertificateId()) {
                // Serial is locked during edit — ignore auto/manual toggles.
                syncCertificateFormModeUI();
                return;
            }
            certIdAutoMode = Boolean(autoEnabled);
            const input = document.getElementById('admCertId');
            const modeBtn = document.getElementById('admCertIdModeBtn');
            const hint = document.getElementById('admCertIdDupHint');
            const modeHint = document.getElementById('admCertIdHint');

            if (input) {
                input.readOnly = certIdAutoMode;
                input.removeAttribute('disabled');
                if (certIdAutoMode) {
                    input.value = previewNextCertificateId();
                }
            }

            if (modeBtn) {
                modeBtn.disabled = false;
                modeBtn.textContent = certIdAutoMode ? "Auto Mode" : "Manual Mode";
                modeBtn.classList.toggle("is-auto", certIdAutoMode);
                modeBtn.classList.toggle("is-manual", !certIdAutoMode);
                modeBtn.setAttribute("aria-pressed", certIdAutoMode ? "true" : "false");
                modeBtn.title = certIdAutoMode
                    ? "Click to switch to Manual Mode"
                    : "Click to switch to Auto Mode";
            }

            if (modeHint) {
                modeHint.textContent = certIdAutoMode
                    ? "Auto Mode assigns the next sequential ID (TSI-YYYY-NNN). Switch to Manual to type a custom ID."
                    : "Manual Mode — type a custom Certificate ID. It must be unique.";
            }

            if (hint) {
                hint.textContent = "";
                hint.hidden = true;
            }
        }

        function toggleCertIdMode() {
            setCertIdMode(!certIdAutoMode);
        }

        function checkManualCertIdDuplicate() {
            const input = document.getElementById('admCertId');
            const hint = document.getElementById('admCertIdDupHint');
            if (!input) return false;
            const id = input.value.trim().toUpperCase();
            const editingId = getEditingCertificateId();
            const duplicate = Boolean(id) && adminCache.certificates.some((cert) =>
                String(cert.certificate_id || '').toUpperCase() === id
                && (!editingId || cert.id !== editingId)
            );
            if (hint) {
                hint.textContent = duplicate ? "A certificate with this ID already exists." : "";
                hint.hidden = !duplicate;
            }
            return duplicate;
        }

        async function handleAdminCreateCourse(event) {
            event.preventDefault();
            if (!(await requireAdminSession())) return;

            const payload = {
                name: document.getElementById('admCourseName').value.trim(),
                category: document.getElementById('admCourseCategory').value.trim(),
                duration: document.getElementById('admCourseDuration').value.trim() || null,
                description: document.getElementById('admCourseDesc').value.trim() || null,
                is_archived: false
            };

            const { error } = await supabaseClient.from('courses').insert(payload);
            if (error) {
                console.error("[Courses] Insert error:", error);
                showToast(`⚠️ Could not save course: ${error.message}`, "info");
                return;
            }

            event.target.reset();
            showToast("✅ Course saved.", "success");
            await refreshAdminDashboard();
            await logAdminActivity('course_created', 'courses', { name: payload.name, category: payload.category });
        }

        async function handleAdminCreateBatch(event) {
            event.preventDefault();
            if (!(await requireAdminSession())) return;

            const payload = {
                course_id: document.getElementById('admBatchCourse').value,
                start_date: document.getElementById('admBatchStart').value,
                schedule: document.getElementById('admBatchSchedule').value.trim(),
                instructor_name: document.getElementById('admBatchInstructor').value.trim(),
                capacity: Number(document.getElementById('admBatchCapacity').value || 0),
                is_archived: false
            };

            const { error } = await supabaseClient.from('batches').insert(payload);
            if (error) {
                console.error(error);
                showToast(`⚠️ Could not save batch: ${error.message}`, "info");
                return;
            }

            event.target.reset();
            document.getElementById('admBatchCapacity').value = "25";
            showToast("✅ Batch scheduled.", "success");
            await refreshAdminDashboard();
            await logAdminActivity('batch_created', 'batches', { course_id: payload.course_id, start_date: payload.start_date });
        }

        async function handleAdminIssueCertificate(event) {
            event.preventDefault();
            if (!(await requireAdminSession())) return;

            const editingId = getEditingCertificateId();
            const isEditMode = Boolean(editingId);

            const studentId = document.getElementById('admCertStudent')?.value;
            const student = adminCache.students.find((s) => s.id === studentId);

            if (!isEditMode && isCertIdAutoMode()) setCertIdMode(true);
            if (!isEditMode && !isCertIdAutoMode() && checkManualCertIdDuplicate()) {
                showToast("⚠️ Choose a unique certificate ID.", "info");
                return;
            }

            const existing = isEditMode
                ? adminCache.certificates.find((c) => c.id === editingId)
                : null;
            if (isEditMode && !existing) {
                showToast("⚠️ Cannot update — certificate record not found. Resetting to create mode.", "warning");
                resetCertificateForm();
                return;
            }

            // Preserve original serial in edit mode; never mint a new ID on update.
            const serial = isEditMode
                ? String(existing.certificate_id || "").trim().toUpperCase()
                : document.getElementById('admCertId')?.value.trim().toUpperCase();

            const payload = {
                certificate_id: serial,
                student_id: studentId,
                course_id: student?.course_id || existing?.course_id || null,
                father_name: document.getElementById('admCertFather')?.value.trim() || "",
                issue_date: toDateInputValue(document.getElementById('admCertIssueDate')?.value)
                    || parseFlexibleDate(document.getElementById('admCertIssueDate')?.value),
                expiry_date: toDateInputValue(document.getElementById('admCertExpiry')?.value || "")
                    || parseFlexibleDate(document.getElementById('admCertExpiry')?.value || "")
                    || null,
                grade: document.getElementById('admCertGrade')?.value.trim() || null,
                student_dob: toDateInputValue(student?.dob) || student?.dob || existing?.student_dob || null,
                status: (existing?.status || "active")
            };

            // Keep display names in sync for public verify RPC (even if trigger maps them).
            if (student?.full_name) payload.student_name = student.full_name;
            else if (existing?.student_name) payload.student_name = existing.student_name;

            const courseName = student?.courses?.name
                || resolveStudentCourseLabel?.(student?.course_id || existing?.course_id)
                || existing?.course_name
                || null;
            if (courseName) payload.course_name = courseName;

            if (!payload.certificate_id || !student || !payload.father_name || !payload.issue_date) {
                showToast("⚠️ Certificate ID, student, father's name, and issue date are required.", "info");
                return;
            }

            const assocSnapshot = document.getElementById('admCertAssociation')?.value ?? "";
            const submitBtn = document.getElementById("admCertSubmitBtn");
            setButtonLoading(submitBtn, true, isEditMode ? "Updating…" : "Issuing…");

            let data = null;
            let error = null;

            try {
                if (isEditMode) {
                    // UPDATE existing row by primary key — same serial, no duplicate insert.
                    const updatePayload = { ...payload };
                    // Never rotate the public serial during edit.
                    updatePayload.certificate_id = existing.certificate_id;

                    ({ data, error } = await supabaseClient
                        .from("certificates")
                        .update(updatePayload)
                        .eq("id", editingId)
                        .select("id, certificate_id")
                        .maybeSingle());

                    if (error) {
                        const message = String(error.message || "").toLowerCase();
                        console.error("[Certificates] Update failed:", error);
                        if (message.includes("expiry_date")) {
                            delete updatePayload.expiry_date;
                            ({ data, error } = await supabaseClient
                                .from("certificates")
                                .update(updatePayload)
                                .eq("id", editingId)
                                .select("id, certificate_id")
                                .maybeSingle());
                        }
                        if (error && /student_dob|column/i.test(String(error.message || ""))) {
                            delete updatePayload.student_dob;
                            ({ data, error } = await supabaseClient
                                .from("certificates")
                                .update(updatePayload)
                                .eq("id", editingId)
                                .select("id, certificate_id")
                                .maybeSingle());
                        }
                    }

                    // Fallback UPSERT by unique certificate_id if PK update missed the row.
                    if (!error && !data) {
                        console.warn("[Certificates] UPDATE returned no row — retrying upsert on certificate_id.");
                        ({ data, error } = await supabaseClient
                            .from("certificates")
                            .upsert(updatePayload, { onConflict: "certificate_id" })
                            .select("id, certificate_id")
                            .maybeSingle());
                    }
                } else {
                    ({ data, error } = await supabaseClient
                        .from("certificates")
                        .insert(payload)
                        .select("id, certificate_id")
                        .maybeSingle());

                    if (error) {
                        const message = String(error.message || "").toLowerCase();
                        console.error("[Certificates] Insert failed:", error);
                        if (message.includes("expiry_date")) {
                            delete payload.expiry_date;
                            ({ data, error } = await supabaseClient
                                .from("certificates")
                                .insert(payload)
                                .select("id, certificate_id")
                                .maybeSingle());
                        }
                        if (error && String(error.message || "").toLowerCase().includes("student_dob")) {
                            delete payload.student_dob;
                            ({ data, error } = await supabaseClient
                                .from("certificates")
                                .insert(payload)
                                .select("id, certificate_id")
                                .maybeSingle());
                        }
                        // Unique serial collision → upsert overwrite (same ID = update).
                        if (error && /duplicate|unique|certificate_id/i.test(String(error.message || ""))) {
                            console.warn("[Certificates] Duplicate serial — upserting existing certificate_id.");
                            ({ data, error } = await supabaseClient
                                .from("certificates")
                                .upsert(payload, { onConflict: "certificate_id" })
                                .select("id, certificate_id")
                                .maybeSingle());
                        }
                    }
                }

                if (error) {
                    console.error("[Certificates] Save error:", error);
                    console.error("[Certificates] code:", error.code);
                    console.error("[Certificates] message:", error.message);
                    console.error("[Certificates] details:", error.details);
                    showToast(`⚠️ Could not ${isEditMode ? "update" : "issue"} certificate: ${error.message}`, "warning");
                    return;
                }

                showToast(
                    isEditMode
                        ? "✅ Certificate updated successfully."
                        : "✅ Certificate issued.",
                    "success"
                );

                await logAdminActivity(
                    isEditMode ? "certificate_updated" : "certificate_issued",
                    "certificates",
                    {
                        id: data?.id || editingId,
                        certificate_id: payload.certificate_id,
                        student_id: studentId,
                        mode: isEditMode ? "update" : "create"
                    }
                );

                const savedId = data?.id || editingId;
                resetCertificateForm();
                const assocInput = document.getElementById("admCertAssociation");
                if (assocInput) assocInput.value = assocSnapshot;

                await refreshAdminDashboard();

                if (savedId) {
                    selectedCertRenderId = savedId;
                    const studentSelect = document.getElementById("admCertStudent");
                    if (studentSelect) studentSelect.value = studentId;
                }
            } catch (err) {
                console.error("[Certificates] Unexpected save failure:", err);
                showToast(`⚠️ Certificate save failed: ${err.message || err}`, "warning");
            } finally {
                setButtonLoading(submitBtn, false);
            }
        }

        async function handleAdminArchiveStudent(studentId) {
            if (!(await requireAdminSession())) return;
            if (!window.confirm("Archive this student record?")) return;

            const { error } = await supabaseClient
                .from('students')
                .update({ is_archived: true })
                .eq('id', studentId);

            if (error) {
                showToast(`⚠️ Archive failed: ${error.message}`, "info");
                return;
            }

            showToast("✅ Student archived.", "success");
            await refreshAdminDashboard();
            await logAdminActivity('student_archived', 'students', { student_id: studentId });
        }

        async function handleAdminToggleCourseArchive(courseId, currentlyArchived) {
            if (!(await requireAdminSession())) return;

            const { error } = await supabaseClient
                .from('courses')
                .update({ is_archived: !currentlyArchived })
                .eq('id', courseId);

            if (error) {
                showToast(`⚠️ Update failed: ${error.message}`, "info");
                return;
            }

            showToast(currentlyArchived ? "✅ Course restored." : "✅ Course archived.", "success");
            await refreshAdminDashboard();
            await logAdminActivity(currentlyArchived ? 'course_restored' : 'course_archived', 'courses', { course_id: courseId });
        }

        async function handleAdminArchiveBatch(batchId) {
            if (!(await requireAdminSession())) return;
            if (!window.confirm("Archive this batch?")) return;

            const { error } = await supabaseClient
                .from('batches')
                .update({ is_archived: true })
                .eq('id', batchId);

            if (error) {
                showToast(`⚠️ Archive failed: ${error.message}`, "info");
                return;
            }

            showToast("✅ Batch archived.", "success");
            await refreshAdminDashboard();
            await logAdminActivity('batch_archived', 'batches', { batch_id: batchId });
        }

        async function handleAdminRevokeCertificate(certRowId) {
            if (!(await requireAdminSession())) return;
            if (!window.confirm("Revoke this certificate? Public verification will show it as revoked.")) return;

            const { error } = await supabaseClient
                .from('certificates')
                .update({ status: 'revoked' })
                .eq('id', certRowId);

            if (error) {
                showToast(`⚠️ Revoke failed: ${error.message}`, "info");
                return;
            }

            showToast("✅ Certificate revoked.", "success");
            await refreshAdminDashboard();
            await logAdminActivity('certificate_revoked', 'certificates', { id: certRowId });
        }

        async function handleAdminRestoreCertificate(certRowId) {
            if (!(await requireAdminSession())) return;

            const { error } = await supabaseClient
                .from('certificates')
                .update({ status: 'active' })
                .eq('id', certRowId);

            if (error) {
                showToast(`⚠️ Restore failed: ${error.message}`, "info");
                return;
            }

            showToast("✅ Certificate restored to active.", "success");
            await refreshAdminDashboard();
            await logAdminActivity('certificate_restored', 'certificates', { id: certRowId });
        }

        function delay(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }

        async function refreshAdminLeads() {
            if (!(await requireAdminSession())) return;
            // Must match the same public.leads table used by Apply Online / Inquiry forms
            let { data, error } = await supabaseClient
                .from('leads')
                .select('id, full_name, father_name, dob, email, phone, course_id, course_interest, message, status, created_at')
                .order('created_at', { ascending: false });

            if (error && /father_name|dob|course_id|column/i.test(String(error.message || ""))) {
                console.warn('[Leads] Falling back to legacy lead columns:', error.message);
                ({ data, error } = await supabaseClient
                    .from('leads')
                    .select('id, full_name, email, phone, course_interest, message, status, created_at')
                    .order('created_at', { ascending: false }));
                if (!error && data) {
                    data = data.map((lead) => ({
                        ...lead,
                        father_name: null,
                        dob: null,
                        course_id: null
                    }));
                }
            }

            if (error) {
                console.error('[Leads] Admin refresh failed:', error);
                console.error('[Leads] Admin refresh details:', JSON.stringify(error, null, 2));
                return;
            }
            adminCache.leads = data || [];
            renderAdminLeadsTable();
            console.log('[Leads] Admin panel loaded', adminCache.leads.length, 'inquiries from public.leads');
        }

        function resolveCourseIdFromLeadInterest(courseInterest, explicitCourseId = null) {
            const catalog = [
                ...(adminCache.courses || []),
                ...(typeof publicCoursesCache !== "undefined" ? publicCoursesCache : [])
            ];
            if (explicitCourseId && catalog.some((c) => c.id === explicitCourseId && !c.is_archived)) {
                return explicitCourseId;
            }
            const raw = String(courseInterest || "").trim();
            if (!raw) return null;
            const courseName = raw.includes("›")
                ? raw.split("›").pop().trim()
                : raw;
            const needle = courseName.toLowerCase();
            const baseNeedle = needle.replace(/\s*\([^)]*\)\s*$/, "").trim();
            const match = catalog.find((c) => {
                if (c.is_archived) return false;
                const name = String(c.name || "").trim().toLowerCase();
                if (!name) return false;
                return name === needle
                    || name === baseNeedle
                    || needle.startsWith(name)
                    || name.startsWith(baseNeedle);
            });
            return match?.id || null;
        }

        function parseLeadProfileExtras(lead) {
            const message = String(lead?.message || "");
            const fatherFromMsg = (message.match(/Father:\s*(.+)/i) || [])[1]?.trim() || "";
            const dobFromMsg = (message.match(/DOB:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i) || [])[1] || "";
            return {
                father_name: lead?.father_name || fatherFromMsg || null,
                dob: lead?.dob || dobFromMsg || null
            };
        }

        function renderAdminLeadsTable() {
            const body = document.getElementById('adminLeadsBody');
            if (!body) return;
            const filter = document.getElementById('leadsStatusFilter')?.value || '';
            const leads = adminCache.leads.filter((lead) => !filter || lead.status === filter);
            if (!leads.length) {
                body.innerHTML = `<tr><td colspan="7" class="admin-table-empty">No inquiries found.</td></tr>`;
                return;
            }

            const statuses = ['new', 'contacted', 'enrolled', 'archived'];
            body.innerHTML = leads.map((lead) => {
                const safeId = escapeJsString(lead.id);
                const extras = parseLeadProfileExtras(lead);
                const phoneDigits = String(lead.phone || '').replace(/[^\d]/g, '');
                const wa = phoneDigits
                    ? `https://wa.me/${phoneDigits.startsWith('92') ? phoneDigits : phoneDigits.replace(/^0/, '92')}`
                    : '';
                const contactBits = [
                    lead.email ? escapeHtml(lead.email) : '',
                    lead.phone
                        ? (wa
                            ? `<a class="lead-contact-link" href="${escapeHtml(wa)}" target="_blank" rel="noopener">${escapeHtml(lead.phone)}</a>`
                            : escapeHtml(lead.phone))
                        : ''
                ].filter(Boolean).join('<br>');
                const detailBits = [
                    extras.father_name ? `Father: ${escapeHtml(extras.father_name)}` : '',
                    extras.dob ? `DOB: ${escapeHtml(formatDisplayDate(extras.dob))}` : '',
                    lead.message ? escapeHtml(lead.message) : ''
                ].filter(Boolean).join('<br>');
                const alreadyEnrolled = String(lead.status || '').toLowerCase() === 'enrolled';

                return `<tr>
                    <td><strong>${escapeHtml(lead.full_name)}</strong></td>
                    <td>${contactBits || '—'}</td>
                    <td>${escapeHtml(lead.course_interest || '—')}</td>
                    <td class="lead-message-cell">${detailBits || '—'}</td>
                    <td>
                        <select class="lead-status-select" onchange="updateLeadStatus('${safeId}', this.value)">
                            ${statuses.map((status) => `<option value="${status}" ${lead.status === status ? 'selected' : ''}>${status}</option>`).join('')}
                        </select>
                    </td>
                    <td>${formatDisplayDate(lead.created_at)}</td>
                    <td class="lead-actions-cell">
                        ${wa
                            ? `<a class="admin-action-btn" href="${escapeHtml(wa)}" target="_blank" rel="noopener">WhatsApp</a>`
                            : (lead.phone ? `<span class="admin-action-btn" style="pointer-events:none;opacity:.7">${escapeHtml(lead.phone)}</span>` : '')}
                        ${alreadyEnrolled
                            ? `<span class="admin-action-btn lead-add-btn is-done" title="Already promoted">Enrolled</span>`
                            : `<button type="button" class="admin-action-btn lead-add-btn" onclick="promoteLeadToStudent('${safeId}', this)">+ Add as Student</button>`}
                    </td>
                </tr>`;
            }).join('');
        }

        async function updateLeadStatus(id, status) {
            if (!(await requireAdminSession())) return;
            const { error } = await supabaseClient.from('leads').update({ status }).eq('id', id);
            if (error) {
                showToast(`⚠️ Could not update inquiry: ${error.message}`, 'info');
                return;
            }
            await refreshAdminLeads();
        }

        async function promoteLeadToStudent(leadId, buttonEl) {
            if (!(await requireAdminSession())) return;
            const lead = adminCache.leads.find((item) => item.id === leadId);
            if (!lead) {
                showToast("Lead not found. Refresh and try again.", "warning");
                return;
            }
            if (String(lead.status || "").toLowerCase() === "enrolled") {
                showToast("This lead is already enrolled as a student.", "info");
                return;
            }

            const extras = parseLeadProfileExtras(lead);
            const fullName = String(lead.full_name || "").trim();
            const fatherName = String(extras.father_name || "").trim();
            const dob = extras.dob || "";
            const email = normalizeEmail(lead.email || "");
            const phone = lead.phone ? String(lead.phone).trim() : null;
            const courseId = resolveCourseIdFromLeadInterest(lead.course_interest, lead.course_id);
            const enrollmentDate = getLocalDateISO();

            if (!fullName) {
                showToast("This lead is missing a student name.", "warning");
                return;
            }
            if (!dob) {
                showToast("This lead is missing date of birth. Ask the applicant to re-apply with DOB, or add the student manually.", "warning");
                return;
            }

            const studentPayload = {
                full_name: fullName,
                father_name: fatherName || null,
                dob,
                email: email && isValidEmail(email) && !email.endsWith("@admissions.tsi.local") ? email : (email || null),
                phone,
                course_id: courseId,
                batch_id: null,
                status: "active",
                enrollment_date: enrollmentDate,
                is_archived: false
            };

            if (buttonEl) {
                buttonEl.disabled = true;
                buttonEl.textContent = "Adding…";
            }

            try {
                let { error } = await supabaseClient.from("students").insert(studentPayload);

                if (error && String(error.message || "").toLowerCase().includes("father_name")) {
                    delete studentPayload.father_name;
                    ({ error } = await supabaseClient.from("students").insert(studentPayload));
                }

                if (error && !courseId && /course_id|null value/i.test(String(error.message || ""))) {
                    console.error("[Promote Lead] course_id required by schema:", error);
                    showToast("Could not promote lead: database still requires a course. Assign a matching course in Courses, or run the course_id nullable upgrade.", "warning");
                    if (buttonEl) {
                        buttonEl.disabled = false;
                        buttonEl.textContent = "+ Add as Student";
                    }
                    return;
                }

                if (error) {
                    console.error("[Promote Lead] Student insert failed:", error);
                    showToast(`Could not promote lead: ${error.message}`, "warning");
                    if (buttonEl) {
                        buttonEl.disabled = false;
                        buttonEl.textContent = "+ Add as Student";
                    }
                    return;
                }

                syncStudentToGoogleSheet({
                    studentName: fullName,
                    fatherName: fatherName || "",
                    dob,
                    email: studentPayload.email || "",
                    contact: phone || "",
                    course: resolveStudentCourseLabel(courseId) || lead.course_interest || NO_COURSE_YET_LABEL,
                    courseStatus: "active",
                    enrollmentDate
                });

                const { error: leadUpdateError } = await supabaseClient
                    .from("leads")
                    .update({ status: "enrolled" })
                    .eq("id", leadId);

                if (leadUpdateError) {
                    console.warn("[Promote Lead] Student created, but lead status update failed:", leadUpdateError);
                }

                await logAdminActivity("lead_promoted_to_student", "students", {
                    lead_id: leadId,
                    full_name: fullName,
                    course_id: courseId
                });

                showToast("Lead successfully promoted to official Student!", "success");
                await refreshAdminLeads();
                await refreshAdminDashboard();
            } catch (err) {
                console.error("[Promote Lead] Unexpected failure:", err);
                showToast("Could not promote this lead right now. Please try again.", "warning");
                if (buttonEl) {
                    buttonEl.disabled = false;
                    buttonEl.textContent = "+ Add as Student";
                }
            }
        }

        async function handlePublicInquirySubmit(event) {
            event.preventDefault();
            const form = document.getElementById("publicInquiryForm");
            if (!form) return;
            if (!requireSupabaseClient()) return;

            const payload = {
                full_name: sanitizeInput(document.getElementById('inqFullName')?.value || "", { maxLength: 120 }),
                father_name: sanitizeInput(document.getElementById('inqFatherName')?.value || "", { maxLength: 120 }) || null,
                dob: sanitizeInput(document.getElementById('inqDob')?.value || "", { maxLength: 10 }) || null,
                email: normalizeEmail(sanitizeInput(document.getElementById('inqEmail')?.value || "", {
                    maxLength: 120,
                    preserveEmail: true
                })),
                phone: sanitizePhone(document.getElementById('inqPhone')?.value || "") || null,
                course_interest: sanitizeInput(document.getElementById('inqCourse')?.value || "", { maxLength: 150 }) || null,
                message: sanitizeInput(document.getElementById('inqMessage')?.value || "", {
                    maxLength: 2000,
                    allowNewlines: true
                }) || null,
                status: 'new'
            };

            if (!payload.full_name || !payload.father_name || !payload.dob || !payload.email || !payload.phone || !payload.course_interest || !payload.message) {
                showToast('Please complete all inquiry fields.', 'info');
                return;
            }
            if (!isValidEmail(payload.email)) {
                showToast('Please enter a valid email address.', 'info');
                return;
            }

            payload.course_id = resolveCourseIdFromLeadInterest(payload.course_interest);

            const submitBtn = document.getElementById('inqSubmitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending…';
            }

            const { error } = await insertPublicLead(payload);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Inquiry';
            }

            if (error) {
                showToast('We could not send your inquiry right now. Please try again shortly.', 'warning');
                return;
            }

            form.reset();
            showInquirySuccessToast();
        }

        /** General contact form on contact.html — WhatsApp / mailto only (not leads DB). */
        async function handleGeneralContactSubmit(event) {
            event.preventDefault();
            const form = document.getElementById("generalContactForm");
            if (!form) return;

            const name = sanitizeInput(document.getElementById("genFullName")?.value || "", { maxLength: 120 });
            const email = normalizeEmail(sanitizeInput(document.getElementById("genEmail")?.value || "", {
                maxLength: 120,
                preserveEmail: true
            }));
            const subject = sanitizeInput(document.getElementById("genSubject")?.value || "", { maxLength: 150 });
            const message = sanitizeInput(document.getElementById("genMessage")?.value || "", {
                maxLength: 2000,
                allowNewlines: true
            });

            if (!name || !email || !subject || !message) {
                showToast("Please complete all contact fields.", "info");
                return;
            }
            if (!isValidEmail(email)) {
                showToast("Please enter a valid email address.", "info");
                return;
            }

            const submitBtn = document.getElementById("genContactSubmitBtn");
            setButtonLoading(submitBtn, true, "Opening…");

            const waText = [
                `General inquiry from TSI website`,
                `Name: ${name}`,
                `Email: ${email}`,
                `Subject: ${subject}`,
                "",
                message
            ].join("\n");

            const waUrl = `https://wa.me/923469709296?text=${encodeURIComponent(waText)}`;
            const mailUrl = `mailto:info@tsi.com?subject=${encodeURIComponent(`[TSI Contact] ${subject}`)}&body=${encodeURIComponent(waText)}`;

            try {
                window.open(waUrl, "_blank", "noopener");
            } catch (_) {
                window.location.href = waUrl;
            }

            setTimeout(() => {
                try { window.location.href = mailUrl; } catch (_) { /* ignore */ }
            }, 600);

            form.reset();
            showToast("Opening WhatsApp / email so you can send your message.", "success");
            setButtonLoading(submitBtn, false);
        }

        /** Official student admission form on admissions.html → public.leads */
        async function handleStudentAdmissionSubmit(event) {
            event.preventDefault();
            const form = document.getElementById("studentAdmissionForm");
            if (!form) return;
            if (!requireSupabaseClient()) return;

            const fullName = sanitizeInput(document.getElementById("admAppFullName")?.value || "", { maxLength: 120 });
            const fatherName = sanitizeInput(document.getElementById("admAppFatherName")?.value || "", { maxLength: 120 });
            const phone = sanitizePhone(document.getElementById("admAppPhone")?.value || "");
            const guardianPhone = sanitizePhone(document.getElementById("admAppGuardianPhone")?.value || "");
            const course = sanitizeInput(document.getElementById("admAppCourse")?.value || "", { maxLength: 150 });
            const shift = sanitizeInput(document.getElementById("admAppShift")?.value || "", { maxLength: 40 });

            if (!fullName || !fatherName || !phone || !guardianPhone || !course || !shift) {
                showToast("Please complete all admission form fields.", "info");
                return;
            }

            const digits = String(phone).replace(/\D/g, "") || "unknown";
            const payload = {
                full_name: fullName,
                father_name: fatherName,
                email: `admission.${digits}@tsi.com`,
                phone,
                course_interest: course,
                course_id: resolveCourseIdFromLeadInterest(course),
                message: [
                    "Official student admission application",
                    `Preferred shift: ${shift}`,
                    `Student phone: ${phone}`,
                    `Father / Guardian phone: ${guardianPhone}`
                ].join("\n"),
                status: "new"
            };

            const submitBtn = document.getElementById("admAppSubmitBtn");
            setButtonLoading(submitBtn, true, "Submitting…");

            const { error } = await insertPublicLead(payload);

            setButtonLoading(submitBtn, false);

            if (error) {
                showToast(`⚠️ Could not submit application: ${error.message || error}`, "warning");
                return;
            }

            form.reset();
            initStudentAdmissionCourseSelect();
            showToast("Application submitted! Our admissions team will contact you shortly.", "success");
        }

        function destroyAdminCharts() {
            enrollmentChart?.destroy();
            courseDistChart?.destroy();
            enrollmentChart = null;
            courseDistChart = null;
        }

        function getChartThemeColors() {
            const light = document.body.classList.contains('light-mode');
            return {
                text: light ? '#334155' : '#dbeafe',
                grid: light ? 'rgba(51,65,85,.14)' : 'rgba(219,234,254,.18)',
                lineGradStops: ['rgba(37,99,235,.42)', 'rgba(37,99,235,0)'],
                doughnut: ['#2563eb', '#7c3aed', '#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444']
            };
        }

        function renderAdminAnalyticsCharts() {
            if (typeof Chart === 'undefined') return;
            const enrollmentCanvas = document.getElementById('enrollmentTrendChart');
            const courseCanvas = document.getElementById('courseDistributionChart');
            if (!enrollmentCanvas && !courseCanvas) return;
            destroyAdminCharts();
            const colors = getChartThemeColors();
            const months = Array.from({ length: 8 }, (_, index) => {
                const date = new Date();
                date.setDate(1);
                date.setMonth(date.getMonth() - (7 - index));
                return date.toISOString().slice(0, 7);
            });
            const enrollments = months.map((month) => adminCache.students
                .filter((student) => String(student.enrollment_date || '').slice(0, 7) === month).length);
            if (enrollmentCanvas) {
                const ctx = enrollmentCanvas.getContext('2d');
                const gradient = ctx.createLinearGradient(0, 0, 0, enrollmentCanvas.height || 220);
                gradient.addColorStop(0, colors.lineGradStops[0]);
                gradient.addColorStop(1, colors.lineGradStops[1]);
                enrollmentChart = new Chart(enrollmentCanvas, {
                    type: 'line',
                    data: { labels: months, datasets: [{ label: 'Enrollments', data: enrollments, borderColor: '#2563eb', backgroundColor: gradient, fill: true, tension: .35 }] },
                    options: { responsive: true, plugins: { legend: { labels: { color: colors.text } } }, scales: { x: { ticks: { color: colors.text }, grid: { color: colors.grid } }, y: { beginAtZero: true, ticks: { precision: 0, color: colors.text }, grid: { color: colors.grid } } } }
                });
            }
            if (courseCanvas) {
                const counts = adminCache.students.reduce((result, student) => {
                    const name = student.courses?.name || 'Unassigned';
                    result[name] = (result[name] || 0) + 1;
                    return result;
                }, {});
                courseDistChart = new Chart(courseCanvas, {
                    type: 'doughnut',
                    data: { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: colors.doughnut }] },
                    options: { responsive: true, plugins: { legend: { labels: { color: colors.text } } } }
                });
            }
        }

        async function logAdminActivity(action, targetTable, details) {
            if (!supabaseClient || !adminSessionUser) return;
            try {
                await supabaseClient.from('activity_logs').insert({
                    action,
                    target_table: targetTable,
                    details: details || {}
                });
            } catch (err) {
                console.warn('Activity log write skipped:', err);
            }
        }

        // =====================================================================
        // =====================================================================
        // Certificate Generation, QR Overlay & PDF Export (FR-5.1 to FR-5.5)
        // =====================================================================

        let certLastRenderedDataUrl = null;

        // Logical design size (A4 landscape ratio). Rendered at CERT_EXPORT_SCALE for print DPI.
        const CERT_BASE_WIDTH = 1200;
        const CERT_BASE_HEIGHT = 850;
        const CERT_EXPORT_SCALE = 2;

        // =====================================================================
        // Premium certificate design tokens + Canva-style live editable fields
        // =====================================================================
        const CERT_FONT_SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
        const CERT_FONT_SANS = "'DM Sans', 'Segoe UI', Arial, sans-serif";

        const CERT_COLORS = {
            ivoryTop: "#fdf9ef",
            ivoryMid: "#fbf2e1",
            ivoryBottom: "#f6ead2",
            gold: "#b8892f",
            goldDark: "#8a651f",
            goldLight: "#d9b46a",
            charcoal: "#2b2620",
            muted: "#6c6053",
            hairline: "rgba(138, 101, 31, 0.35)"
        };

        // Absolute pixel layout — original certificate frame grid.
        // Variable fields (name/course) wrap in-place with font shrink; other
        // nodes keep fixed coordinates so the gold frame never shifts.
        const CERT_DEFAULT_COPY = {
            instituteName: "THE SPECTRUM INSTITUTE",
            instituteSubtitle: "Barikot & Mingora, Swat — Professional Technical Education",
            certNoLabel: "CERTIFICATE NO.",
            titleMain: "CERTIFICATE",
            titleSubCompletion: "OF COMPLETION",
            titleSubAppreciation: "OF APPRECIATION",
            preamble: "This certificate is proudly presented to",
            bodyCompletion: "has successfully completed the requirements of the training programme",
            bodyAppreciation: "is hereby recognized for outstanding dedication and achievement in",
            issueDateLabel: "ISSUE DATE",
            creditsLabel: "CREDITS / GRADE",
            footerDisclaimer: "Scan the QR code to validate authenticity online.",
            sig1Name: "Authorized Signatory",
            sig1Title: "Director / Academic Head",
            sig2Name: "Examination Cell",
            sig2Title: "Registrar / Exam Officer"
        };

        const CERT_TEXT_LAYOUT = [
            { field: "instituteName", x: 130, y: 112, maxWidth: 400, font: CERT_FONT_SANS, weight: "700", italic: false, size: 13, minSize: 10, color: CERT_COLORS.goldDark, align: "left", placeholder: CERT_DEFAULT_COPY.instituteName },
            { field: "instituteSubtitle", x: 130, y: 130, maxWidth: 440, font: CERT_FONT_SANS, weight: "500", italic: false, size: 11, minSize: 9, color: CERT_COLORS.muted, align: "left", placeholder: CERT_DEFAULT_COPY.instituteSubtitle },
            { field: "certNoLabel", x: 1070, y: 106, maxWidth: 220, font: CERT_FONT_SANS, weight: "700", italic: false, size: 10, minSize: 8, color: CERT_COLORS.muted, align: "right", placeholder: CERT_DEFAULT_COPY.certNoLabel },
            { field: "serialNo", x: 1070, y: 126, maxWidth: 220, font: CERT_FONT_SANS, weight: "700", italic: false, size: 15, minSize: 11, color: CERT_COLORS.charcoal, align: "right", placeholder: "TSI-YYYY-NNN" },
            { field: "titleMain", x: 600, y: 172, maxWidth: 840, font: CERT_FONT_SERIF, weight: "700", italic: false, size: 48, minSize: 30, color: CERT_COLORS.charcoal, align: "center", placeholder: CERT_DEFAULT_COPY.titleMain },
            { field: "titleSub", x: 600, y: 210, maxWidth: 720, font: CERT_FONT_SANS, weight: "600", italic: false, size: 22, minSize: 14, color: CERT_COLORS.gold, align: "center", tracked: true, placeholder: CERT_DEFAULT_COPY.titleSubCompletion },
            { field: "preamble", x: 600, y: 274, maxWidth: 760, font: CERT_FONT_SERIF, weight: "500", italic: true, size: 17, minSize: 13, color: CERT_COLORS.muted, align: "center", placeholder: CERT_DEFAULT_COPY.preamble },
            { field: "studentName", x: 600, y: 326, maxWidth: 960, font: CERT_FONT_SERIF, weight: "700", italic: false, size: 42, minSize: 22, color: CERT_COLORS.charcoal, align: "center", placeholder: "Student Full Name", maxLines: 2 },
            { field: "fatherLine", x: 600, y: 380, maxWidth: 720, font: CERT_FONT_SANS, weight: "500", italic: false, size: 15, minSize: 11, color: CERT_COLORS.muted, align: "center", placeholder: "S/O Father's Name" },
            { field: "bodyLine", x: 600, y: 414, maxWidth: 780, font: CERT_FONT_SERIF, weight: "500", italic: true, size: 16, minSize: 12, color: CERT_COLORS.muted, align: "center", placeholder: CERT_DEFAULT_COPY.bodyCompletion },
            { field: "courseName", x: 600, y: 448, maxWidth: 960, font: CERT_FONT_SANS, weight: "700", italic: false, size: 24, minSize: 14, color: CERT_COLORS.goldDark, align: "center", placeholder: "Course / Program Name", maxLines: 2, quote: true },
            { field: "issueDateLabel", x: 110, y: 542, maxWidth: 220, font: CERT_FONT_SANS, weight: "700", italic: false, size: 10, minSize: 8, color: CERT_COLORS.muted, align: "left", placeholder: CERT_DEFAULT_COPY.issueDateLabel },
            { field: "issueDateText", x: 110, y: 564, maxWidth: 240, font: CERT_FONT_SANS, weight: "700", italic: false, size: 16, minSize: 12, color: CERT_COLORS.charcoal, align: "left", placeholder: "DD Mon YYYY" },
            { field: "creditsLabel", x: 110, y: 596, maxWidth: 220, font: CERT_FONT_SANS, weight: "700", italic: false, size: 10, minSize: 8, color: CERT_COLORS.muted, align: "left", placeholder: CERT_DEFAULT_COPY.creditsLabel },
            { field: "credits", x: 110, y: 618, maxWidth: 240, font: CERT_FONT_SANS, weight: "700", italic: false, size: 16, minSize: 12, color: CERT_COLORS.gold, align: "left", placeholder: "Grade / CPD Credits" },
            { field: "sig1Name", x: 335, y: 724, maxWidth: 210, font: CERT_FONT_SANS, weight: "700", italic: false, size: 14, minSize: 10, color: CERT_COLORS.charcoal, align: "center", placeholder: CERT_DEFAULT_COPY.sig1Name },
            { field: "sig1Title", x: 335, y: 747, maxWidth: 210, font: CERT_FONT_SANS, weight: "500", italic: false, size: 11.5, minSize: 9, color: CERT_COLORS.muted, align: "center", placeholder: CERT_DEFAULT_COPY.sig1Title },
            { field: "sig2Name", x: 865, y: 724, maxWidth: 210, font: CERT_FONT_SANS, weight: "700", italic: false, size: 14, minSize: 10, color: CERT_COLORS.charcoal, align: "center", placeholder: CERT_DEFAULT_COPY.sig2Name },
            { field: "sig2Title", x: 865, y: 747, maxWidth: 210, font: CERT_FONT_SANS, weight: "500", italic: false, size: 11.5, minSize: 9, color: CERT_COLORS.muted, align: "center", placeholder: CERT_DEFAULT_COPY.sig2Title },
            { field: "footerDisclaimer", x: 110, y: 778, maxWidth: 520, font: CERT_FONT_SANS, weight: "500", italic: false, size: 11, minSize: 9, color: "rgba(43, 38, 32, 0.65)", align: "left", placeholder: CERT_DEFAULT_COPY.footerDisclaimer }
        ];

        let certEditState = createDefaultCertEditState();
        let certEditStateCertId = null;
        let certLogoImage = null;
        let certLogoLoadPromise = null;
        let certMeasureCtx = null;
        let certOverlayResizeObserver = null;

        function createDefaultCertEditState() {
            return {
                certType: "completion",
                instituteName: CERT_DEFAULT_COPY.instituteName,
                instituteSubtitle: CERT_DEFAULT_COPY.instituteSubtitle,
                certNoLabel: CERT_DEFAULT_COPY.certNoLabel,
                serialNo: "",
                titleMain: CERT_DEFAULT_COPY.titleMain,
                titleSub: CERT_DEFAULT_COPY.titleSubCompletion,
                preamble: CERT_DEFAULT_COPY.preamble,
                studentName: "",
                fatherLine: "",
                bodyLine: CERT_DEFAULT_COPY.bodyCompletion,
                courseName: "",
                issueDateLabel: CERT_DEFAULT_COPY.issueDateLabel,
                issueDateText: "",
                creditsLabel: CERT_DEFAULT_COPY.creditsLabel,
                credits: "",
                sig1Name: CERT_DEFAULT_COPY.sig1Name,
                sig1Title: CERT_DEFAULT_COPY.sig1Title,
                sig2Name: CERT_DEFAULT_COPY.sig2Name,
                sig2Title: CERT_DEFAULT_COPY.sig2Title,
                footerDisclaimer: CERT_DEFAULT_COPY.footerDisclaimer
            };
        }

        function getCanvasLayoutPayload(editState = certEditState) {
            const out = { certType: editState.certType || "completion" };
            CERT_TEXT_LAYOUT.forEach((def) => {
                out[def.field] = editState[def.field] ?? "";
            });
            return out;
        }

        function applyCanvasLayoutFromRecord(cert, baseState) {
            const layout = cert?.canvas_layout;
            if (!layout || typeof layout !== "object") return baseState;
            const next = { ...baseState };
            CERT_TEXT_LAYOUT.forEach((def) => {
                if (layout[def.field] != null && String(layout[def.field]).trim() !== "") {
                    next[def.field] = String(layout[def.field]);
                }
            });
            if (layout.certType === "appreciation" || layout.certType === "completion") {
                next.certType = layout.certType;
            }
            return next;
        }

        function ensureCertEditStateForCert(cert) {
            if (!cert) return certEditState;
            if (certEditStateCertId === cert.id) {
                const formDate = document.getElementById("admCertIssueDate")?.value;
                if (formDate) certEditState.issueDateText = formatCanvasDate(formDate);
                return certEditState;
            }
            certEditStateCertId = cert.id;
            const formDate = document.getElementById("admCertIssueDate")?.value;
            const issueSource = formDate || cert.issue_date;
            const isAppreciation = String(cert.canvas_layout?.certType || "").toLowerCase() === "appreciation";
            let next = {
                ...createDefaultCertEditState(),
                certType: isAppreciation ? "appreciation" : "completion",
                serialNo: String(cert.certificate_id || "").trim().toUpperCase() || "TSI-YYYY-NNN",
                studentName: String(cert.student_name || "").trim() || "Student Full Name",
                fatherLine: cert.father_name ? `S/O ${String(cert.father_name).trim()}` : "",
                courseName: String(cert.course_name || "").trim() || "Course / Program Name",
                issueDateText: formatCanvasDate(issueSource),
                credits: String(cert.grade || "").trim() || "—",
                titleSub: isAppreciation ? CERT_DEFAULT_COPY.titleSubAppreciation : CERT_DEFAULT_COPY.titleSubCompletion,
                bodyLine: isAppreciation ? CERT_DEFAULT_COPY.bodyAppreciation : CERT_DEFAULT_COPY.bodyCompletion
            };
            next = applyCanvasLayoutFromRecord(cert, next);
            next.serialNo = String(cert.certificate_id || "").trim().toUpperCase() || next.serialNo;
            next.studentName = String(cert.student_name || "").trim() || next.studentName;
            next.fatherLine = cert.father_name ? `S/O ${String(cert.father_name).trim()}` : (next.fatherLine || "");
            next.courseName = String(cert.course_name || "").trim() || next.courseName;
            next.issueDateText = formatCanvasDate(issueSource);
            next.credits = String(cert.grade || "").trim() || next.credits || "—";
            certEditState = next;
            return certEditState;
        }

        function ensureCertLogoLoaded() {
            if (certLogoImage) return Promise.resolve(certLogoImage);
            if (certLogoLoadPromise) return certLogoLoadPromise;
            certLogoLoadPromise = new Promise((resolve) => {
                try {
                    const img = new Image();
                    // CORS-safe: allows canvas export/PDF without tainting when server sends ACAO.
                    // If logo.png is missing or blocked, resolve(null) and use the text seal fallback.
                    img.crossOrigin = "anonymous";
                    img.decoding = "async";
                    img.onload = () => {
                        try {
                            if (!img.naturalWidth || !img.naturalHeight) {
                                console.warn("[Cert] logo.png loaded but has zero dimensions — using seal fallback.");
                                certLogoImage = null;
                                resolve(null);
                                return;
                            }
                            certLogoImage = img;
                            resolve(img);
                        } catch (err) {
                            console.warn("[Cert] logo.png onload handling failed — using seal fallback.", err);
                            certLogoImage = null;
                            resolve(null);
                        }
                    };
                    img.onerror = () => {
                        console.warn("[Cert] logo.png failed to load — using seal fallback. Certificate preview continues.");
                        certLogoImage = null;
                        resolve(null);
                    };
                    img.src = resolveSiteAsset("logo.png");
                } catch (err) {
                    console.warn("[Cert] logo.png loader crashed — using seal fallback.", err);
                    certLogoImage = null;
                    resolve(null);
                }
            });
            return certLogoLoadPromise;
        }
        // ---------------- Signature Images (Authorized Signatory / Examination Cell) ----------------
        let certSignatureImages = { sig1: null, sig2: null };
        let certSignatureLoadPromises = { sig1: null, sig2: null };

        function ensureCertSignatureLoaded(key, relativePath) {
            if (certSignatureImages[key]) return Promise.resolve(certSignatureImages[key]);
            if (certSignatureLoadPromises[key]) return certSignatureLoadPromises[key];
            certSignatureLoadPromises[key] = new Promise((resolve) => {
                try {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.decoding = "async";
                    img.onload = () => {
                        try {
                            if (!img.naturalWidth || !img.naturalHeight) {
                                console.warn(`[Cert] ${relativePath} loaded but has zero dimensions — signature omitted.`);
                                certSignatureImages[key] = null;
                                resolve(null);
                                return;
                            }
                            certSignatureImages[key] = img;
                            resolve(img);
                        } catch (err) {
                            console.warn(`[Cert] ${relativePath} onload handling failed — signature omitted.`, err);
                            certSignatureImages[key] = null;
                            resolve(null);
                        }
                    };
                    img.onerror = () => {
                        console.warn(`[Cert] ${relativePath} failed to load — signature omitted. Certificate preview continues.`);
                        certSignatureImages[key] = null;
                        resolve(null);
                    };
                    img.src = resolveSiteAsset(relativePath);
                } catch (err) {
                    console.warn(`[Cert] ${relativePath} loader crashed — signature omitted.`, err);
                    certSignatureImages[key] = null;
                    resolve(null);
                }
            });
            return certSignatureLoadPromises[key];
        }

        async function drawCertificateSignatureImages(ctx) {
            const targets = [
                { key: "sig1", path: "signatures/spectrum1.png", centerX: 335 },
                { key: "sig2", path: "signatures/spectrum2.png", centerX: 865 }
            ];
            for (const t of targets) {
                const img = await ensureCertSignatureLoaded(t.key, t.path);
                if (!img) continue;
                const maxW = 170;
                const maxH = 62;
                const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
                const w = img.naturalWidth * ratio;
                const h = img.naturalHeight * ratio;
                const x = t.centerX - w / 2;
                const y = 700 - h - 6; // hairline (y:700) ke thoda upar baithegi
                ctx.drawImage(img, x, y, w, h);
            }
        }


        function getCertMeasureCtx() {
            if (!certMeasureCtx) {
                certMeasureCtx = document.createElement("canvas").getContext("2d");
            }
            return certMeasureCtx;
        }

        const CERT_CDN = {
            qrcode: "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
            jspdf: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        };

        let certLibraryLoadPromise = null;

        function loadScriptOnce(src) {
            return new Promise((resolve, reject) => {
                const existing = document.querySelector(`script[data-cert-cdn="${src}"]`);
                if (existing) {
                    if (existing.dataset.loaded === "true") {
                        resolve();
                        return;
                    }
                    existing.addEventListener("load", () => resolve(), { once: true });
                    existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
                    return;
                }

                const script = document.createElement("script");
                script.src = src;
                script.async = true;
                script.dataset.certCdn = src;
                script.onload = () => {
                    script.dataset.loaded = "true";
                    resolve();
                };
                script.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.head.appendChild(script);
            });
        }

        function isQrCodeLibraryReady() {
            return typeof window.QRCode === "function"
                || (typeof window.QRCode === "object" && typeof window.QRCode.toDataURL === "function");
        }

        function getJsPdfConstructor() {
            const ns = window.jspdf || window.jsPDF;
            if (!ns) return null;
            if (typeof ns === "function") return ns;
            if (typeof ns.jsPDF === "function") return ns.jsPDF;
            return null;
        }

        async function ensureExportLibraries() {
            // Make sure the premium Playfair Display / DM Sans webfonts are
            // fully loaded before any canvas measureText/fillText call — otherwise
            // the browser may briefly measure/draw with a fallback font, throwing
            // off the fitTextToWidth calculations and the crispness of the export.
            if (document.fonts && document.fonts.ready) {
                try { await document.fonts.ready; } catch (_) { /* ignore */ }
            }

            if (isQrCodeLibraryReady() && getJsPdfConstructor()) {
                return { QRCode: window.QRCode, JsPDF: getJsPdfConstructor() };
            }

            if (!certLibraryLoadPromise) {
                certLibraryLoadPromise = (async () => {
                    const tasks = [];
                    if (!isQrCodeLibraryReady()) tasks.push(loadScriptOnce(CERT_CDN.qrcode));
                    if (!getJsPdfConstructor()) tasks.push(loadScriptOnce(CERT_CDN.jspdf));
                    await Promise.all(tasks);
                    await new Promise((r) => setTimeout(r, 30));

                    if (!isQrCodeLibraryReady()) {
                        throw new Error("QRCode library is not loaded");
                    }
                    if (!getJsPdfConstructor()) {
                        throw new Error("jsPDF library is not loaded");
                    }
                })().finally(() => {
                    if (!isQrCodeLibraryReady() || !getJsPdfConstructor()) {
                        certLibraryLoadPromise = null;
                    }
                });
            }

            await certLibraryLoadPromise;
            return { QRCode: window.QRCode, JsPDF: getJsPdfConstructor() };
        }

        function formatCanvasDate(value) {
            if (!value) return "N/A";
            const formatted = formatDateOnlyDisplay(value);
            return formatted === "—" ? String(value) : formatted;
        }

        function handleCertTemplateSelected(event) {
            // Custom templates removed from the simplified certificate studio.
            if (event?.target) event.target.value = "";
        }

        function prepareCertificateRender(certRowId) {
            selectedCertRenderId = certRowId;
            const cert = adminCache.certificates.find((c) => c.id === certRowId);
            if (cert) {
                const studentSelect = document.getElementById('admCertStudent');
                if (studentSelect && cert.student_id) studentSelect.value = cert.student_id;
                const fatherInput = document.getElementById('admCertFather');
                if (fatherInput && cert.father_name) fatherInput.value = cert.father_name;
                const issueInput = document.getElementById('admCertIssueDate');
                if (issueInput) issueInput.value = toDateInputValue(cert.issue_date) || getLocalDateISO();
                const gradeInput = document.getElementById('admCertGrade');
                if (gradeInput && cert.grade) gradeInput.value = cert.grade;
                const expiryInput = document.getElementById('admCertExpiry');
                if (expiryInput) expiryInput.value = toDateInputValue(cert.expiry_date) || "";
                // Force edit-state reload so canvas uses the synced table date.
                certEditStateCertId = null;
            }
            switchAdminTab('certificates');
            openCertificatePreview();
        }

        function getSelectedCertificateForRender() {
            if (selectedCertRenderId) {
                const byId = adminCache.certificates.find((c) => c.id === selectedCertRenderId);
                if (byId) return byId;
            }
            const studentId = document.getElementById('admCertStudent')?.value;
            if (!studentId) return null;
            return adminCache.certificates
                .filter((c) => c.student_id === studentId && (c.status || '').toLowerCase() === 'active')
                .sort((a, b) => String(b.issue_date || '').localeCompare(String(a.issue_date || '')))[0] || null;
        }

        function loadImageFromDataUrl(dataUrl) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error("Failed to decode QR image"));
                img.src = dataUrl;
            });
        }

        function waitForQrDomReady(host, timeoutMs = 2500) {
            return new Promise((resolve, reject) => {
                const start = Date.now();
                const tick = () => {
                    const canvas = host.querySelector("canvas");
                    const img = host.querySelector("img");
                    if (canvas && canvas.width > 0) {
                        resolve({ type: "canvas", el: canvas });
                        return;
                    }
                    if (img && img.src) {
                        resolve({ type: "img", el: img });
                        return;
                    }
                    if (Date.now() - start > timeoutMs) {
                        reject(new Error("QR code render timed out"));
                        return;
                    }
                    requestAnimationFrame(tick);
                };
                tick();
            });
        }

        async function generateCertificateQrDataUrl(certificateId) {
            await ensureExportLibraries();
            const url = buildVerificationUrl(certificateId);

            if (typeof window.QRCode === "object" && typeof window.QRCode.toDataURL === "function") {
                return window.QRCode.toDataURL(url, {
                    errorCorrectionLevel: "H",
                    margin: 1,
                    width: 512,
                    color: { dark: "#0b1f3a", light: "#00000000" }
                });
            }

            if (typeof window.QRCode !== "function") {
                throw new Error("QRCode library is not loaded");
            }

            let host = document.getElementById("certQrWorkHost");
            if (!host) {
                host = document.createElement("div");
                host.id = "certQrWorkHost";
                host.className = "cert-qr-work-host";
                host.setAttribute("aria-hidden", "true");
                document.body.appendChild(host);
            }
            host.innerHTML = "";

            const correctLevel = window.QRCode.CorrectLevel
                ? window.QRCode.CorrectLevel.H
                : 2;

            new window.QRCode(host, {
                text: url,
                width: 512,
                height: 512,
                colorDark: "#0b1f3a",
                colorLight: "rgba(0,0,0,0)",
                correctLevel
            });

            const ready = await waitForQrDomReady(host);
            if (ready.type === "canvas") {
                return ready.el.toDataURL("image/png");
            }
            return ready.el.src;
        }

        function drawCornerOrnament(ctx, x, y, size, stroke, flipX, flipY) {
            ctx.save();
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 2;
            ctx.beginPath();
            const dx = flipX ? -1 : 1;
            const dy = flipY ? -1 : 1;
            ctx.moveTo(x, y + dy * size);
            ctx.lineTo(x, y);
            ctx.lineTo(x + dx * size, y);
            ctx.stroke();

            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + dx * 10, y + dy * (size - 8));
            ctx.lineTo(x + dx * 10, y + dy * 10);
            ctx.lineTo(x + dx * (size - 8), y + dy * 10);
            ctx.stroke();

            ctx.fillStyle = stroke;
            ctx.beginPath();
            ctx.arc(x + dx * 18, y + dy * 18, 2.75, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Continuous scalloped/wavy line traced around the full perimeter — the
        // elegant "wavy pattern framing" called for by the premium template.
        function drawWavyBorderFrame(ctx, width, height, inset, amplitude, wavelength, color, lineWidth) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            const top = inset, bottom = height - inset, left = inset, right = width - inset;
            const step = 2;

            for (let x = left; x <= right; x += step) {
                const y = top + Math.sin(((x - left) / wavelength) * Math.PI * 2) * amplitude;
                if (x === left) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            for (let y = top; y <= bottom; y += step) {
                const x = right + Math.sin(((y - top) / wavelength) * Math.PI * 2) * amplitude;
                ctx.lineTo(x, y);
            }
            for (let x = right; x >= left; x -= step) {
                const y = bottom + Math.sin(((x - left) / wavelength) * Math.PI * 2) * amplitude;
                ctx.lineTo(x, y);
            }
            for (let y = bottom; y >= top; y -= step) {
                const x = left + Math.sin(((y - top) / wavelength) * Math.PI * 2) * amplitude;
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }

        // Delicate flourish ornament used below the certificate title.
        function drawGoldDividerOrnament(ctx, centerX, y, halfWidth, color) {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(centerX - halfWidth, y);
            ctx.lineTo(centerX - 22, y);
            ctx.moveTo(centerX + 22, y);
            ctx.lineTo(centerX + halfWidth, y);
            ctx.stroke();

            [-14, 14].forEach((dx) => {
                ctx.save();
                ctx.translate(centerX + dx, y);
                ctx.rotate(Math.PI / 4);
                ctx.fillStyle = color;
                ctx.fillRect(-3, -3, 6, 6);
                ctx.restore();
            });

            ctx.beginPath();
            ctx.moveTo(centerX, y - 8);
            ctx.lineTo(centerX + 8, y);
            ctx.lineTo(centerX, y + 8);
            ctx.lineTo(centerX - 8, y);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();
        }

        // Simulated letter-spacing (canvas has no native tracking support).
        function drawTrackedText(ctx, text, centerX, y, letterSpacingPx) {
            const chars = String(text).split("");
            const widths = chars.map((c) => ctx.measureText(c).width);
            const total = widths.reduce((a, b) => a + b, 0) + letterSpacingPx * Math.max(0, chars.length - 1);
            let cursor = centerX - total / 2;
            const prevAlign = ctx.textAlign;
            ctx.textAlign = "left";
            chars.forEach((c, i) => {
                ctx.fillText(c, cursor, y);
                cursor += widths[i] + letterSpacingPx;
            });
            ctx.textAlign = prevAlign;
        }

        function fitTextToWidth(ctx, text, maxWidth, startFontPx, minFontPx, family, weight, italic = false) {
            let size = startFontPx;
            while (size > minFontPx) {
                ctx.font = `${italic ? "italic " : ""}${weight} ${size}px ${family}`;
                if (ctx.measureText(text).width <= maxWidth) break;
                size -= 1;
            }
            return size;
        }

        function wrapCanvasText(ctx, text, maxWidth) {
            const words = String(text || "").trim().split(/\s+/).filter(Boolean);
            if (!words.length) return [""];
            const lines = [];
            let current = words[0];
            for (let i = 1; i < words.length; i += 1) {
                const trial = `${current} ${words[i]}`;
                if (ctx.measureText(trial).width <= maxWidth) {
                    current = trial;
                } else {
                    lines.push(current);
                    current = words[i];
                }
            }
            lines.push(current);
            return lines;
        }

        /** Auto-scale until wrapped text fits within maxLines (default 2). */
        function fitMultilineText(ctx, text, maxWidth, startSize, minSize, family, weight, italic = false, maxLines = 2) {
            let size = startSize;
            let lines = [String(text || "")];
            while (size >= minSize) {
                ctx.font = `${italic ? "italic " : ""}${weight} ${size}px ${family}`;
                lines = wrapCanvasText(ctx, text, maxWidth);
                if (lines.length <= maxLines) break;
                size -= 1;
            }
            ctx.font = `${italic ? "italic " : ""}${weight} ${size}px ${family}`;
            lines = wrapCanvasText(ctx, text, maxWidth);
            return { size, lines };
        }

        /**
         * Association text for canvas/PDF.
         * Empty => omit the whole association block. Never substitutes a default.
         */
        function getCertificateAssociationText() {
            const input = document.getElementById("admCertAssociation");
            if (!input) return "";
            return String(input.value == null ? "" : input.value).trim();
        }

        // Decorative shell only — ivory fill, borders, ornaments, signature
        // rules, and logo badge. ALL copy is drawn from edit-state / HTML overlay.

        // Decorative shell + gold divider. Copy is drawn by overlay / bake path
        // so every label stays contenteditable without double-printing.
        async function drawPremiumCertificateBackground(ctx, width, height, cert, certType) {
            const bg = ctx.createLinearGradient(0, 0, width, height);
            bg.addColorStop(0, CERT_COLORS.ivoryTop);
            bg.addColorStop(0.5, CERT_COLORS.ivoryMid);
            bg.addColorStop(1, CERT_COLORS.ivoryBottom);
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            const glow = ctx.createRadialGradient(width / 2, height * 0.4, 40, width / 2, height * 0.4, width * 0.6);
            glow.addColorStop(0, "rgba(184, 137, 47, 0.07)");
            glow.addColorStop(1, "rgba(184, 137, 47, 0)");
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, height);

            drawWavyBorderFrame(ctx, width, height, 26, 3.2, 46, CERT_COLORS.gold, 2);

            ctx.strokeStyle = CERT_COLORS.goldDark;
            ctx.lineWidth = 1.4;
            ctx.strokeRect(46, 46, width - 92, height - 92);
            ctx.lineWidth = 1;
            ctx.strokeStyle = CERT_COLORS.gold;
            ctx.strokeRect(54, 54, width - 108, height - 108);

            const ornSize = 44;
            drawCornerOrnament(ctx, 66, 66, ornSize, CERT_COLORS.goldDark, false, false);
            drawCornerOrnament(ctx, width - 66, 66, ornSize, CERT_COLORS.goldDark, true, false);
            drawCornerOrnament(ctx, 66, height - 66, ornSize, CERT_COLORS.goldDark, false, true);
            drawCornerOrnament(ctx, width - 66, height - 66, ornSize, CERT_COLORS.goldDark, true, true);

            drawGoldDividerOrnament(ctx, width / 2, 236, 150, CERT_COLORS.gold);

            ctx.strokeStyle = CERT_COLORS.hairline;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(230, 700);
            ctx.lineTo(440, 700);
            ctx.moveTo(760, 700);
            ctx.lineTo(970, 700);
            ctx.stroke();
            await drawCertificateSignatureImages(ctx);

            const logo = await ensureCertLogoLoaded();
            const logoCX = width / 2;
            const logoCY = 696;
            const logoR = 46;

            ctx.save();
            ctx.beginPath();
            ctx.arc(logoCX, logoCY, logoR + 7, 0, Math.PI * 2);
            ctx.strokeStyle = CERT_COLORS.gold;
            ctx.lineWidth = 1.6;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(logoCX, logoCY, logoR, 0, Math.PI * 2);
            ctx.strokeStyle = CERT_COLORS.goldLight;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(logoCX, logoCY, logoR - 6, 0, Math.PI * 2);
            ctx.closePath();
            ctx.save();
            ctx.clip();
            ctx.fillStyle = "#fffdf6";
            ctx.fillRect(logoCX - logoR, logoCY - logoR, logoR * 2, logoR * 2);
            let drewLogo = false;
            if (logo && logo.naturalWidth) {
                try {
                    const d = (logoR - 6) * 2;
                    const ratio = Math.min(d / logo.naturalWidth, d / logo.naturalHeight);
                    const w = logo.naturalWidth * ratio;
                    const h = logo.naturalHeight * ratio;
                    ctx.drawImage(logo, logoCX - w / 2, logoCY - h / 2, w, h);
                    drewLogo = true;
                } catch (err) {
                    console.warn("[Cert] logo.png draw failed (CORS/taint) — using seal fallback.", err);
                    certLogoImage = null;
                }
            }
            if (!drewLogo) {
                ctx.fillStyle = CERT_COLORS.goldDark;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = `700 12px ${CERT_FONT_SANS}`;
                ctx.fillText("TSI", logoCX, logoCY - 6);
                ctx.font = `600 9px ${CERT_FONT_SANS}`;
                ctx.fillText("SEAL", logoCX, logoCY + 9);
            }
            ctx.restore();
            ctx.restore();
        }

        function drawCertificateAssociationBlock(ctx, width) {
            const associationText = getCertificateAssociationText();
            if (!associationText) return;
            const labelY = 490;
            const nameY = 514;
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = CERT_COLORS.muted;
            ctx.font = `italic 500 13px ${CERT_FONT_SANS}`;
            ctx.fillText("in association with", width / 2, labelY);
            const nameSize = fitTextToWidth(ctx, associationText, width * 0.7, 20, 14, CERT_FONT_SERIF, "700", false);
            ctx.fillStyle = CERT_COLORS.charcoal;
            ctx.font = `700 ${nameSize}px ${CERT_FONT_SERIF}`;
            ctx.fillText(associationText, width / 2, nameY);
            ctx.restore();
        }

        function drawCertificateEditableFields(ctx, width, height, editState) {
            ctx.textBaseline = "middle";
            CERT_TEXT_LAYOUT.forEach((def) => {
                let raw = String(editState[def.field] || "").trim() || def.placeholder || "";
                if (def.field === "serialNo") raw = String(raw).toUpperCase();
                if (def.quote) raw = `\u201C${raw}\u201D`;
                ctx.fillStyle = def.color;
                ctx.textAlign = def.align;

                if ((def.maxLines || 1) > 1) {
                    const fitted = fitMultilineText(
                        ctx, raw, def.maxWidth, def.size, def.minSize,
                        def.font, def.weight, def.italic, def.maxLines
                    );
                    const lineH = fitted.size * 1.2;
                    const blockH = lineH * fitted.lines.length;
                    let y = def.y - blockH / 2 + lineH / 2;
                    fitted.lines.forEach((line) => {
                        ctx.font = `${def.italic ? "italic " : ""}${def.weight} ${fitted.size}px ${def.font}`;
                        if (def.tracked) drawTrackedText(ctx, line, def.x, y, 4);
                        else ctx.fillText(line, def.x, y);
                        y += lineH;
                    });
                    return;
                }

                const size = fitTextToWidth(ctx, raw, def.maxWidth, def.size, def.minSize, def.font, def.weight, def.italic);
                ctx.font = `${def.italic ? "italic " : ""}${def.weight} ${size}px ${def.font}`;
                if (def.tracked) drawTrackedText(ctx, raw, def.x, def.y, 4);
                else ctx.fillText(raw, def.x, def.y);
            });

            const nameText = String(editState.studentName || "").trim() || "Student Full Name";
            const nameDef = CERT_TEXT_LAYOUT.find((d) => d.field === "studentName");
            const nameSize = fitTextToWidth(ctx, nameText, nameDef.maxWidth, nameDef.size, nameDef.minSize, nameDef.font, nameDef.weight);
            ctx.font = `${nameDef.weight} ${nameSize}px ${nameDef.font}`;
            const nameWidth = Math.min(ctx.measureText(nameText).width, nameDef.maxWidth);
            ctx.strokeStyle = CERT_COLORS.hairline;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(width / 2 - nameWidth / 2 - 10, 356);
            ctx.lineTo(width / 2 + nameWidth / 2 + 10, 356);
            ctx.stroke();

            drawCertificateAssociationBlock(ctx, width);
        }

        async function drawCertificateQrBlock(ctx, width, height, certificateId) {
            const qrSize = 110;
            const qrX = width - 92 - qrSize;
            const qrY = height - 92 - qrSize - 26;
            const qrDataUrl = await generateCertificateQrDataUrl(certificateId);
            const qrImage = await loadImageFromDataUrl(qrDataUrl);

            // No opaque plate — transparent QR light modules let the ivory
            // certificate texture show through; only a light gold guide stroke.
            ctx.strokeStyle = "rgba(138, 101, 31, 0.35)";
            ctx.lineWidth = 1;
            const pad = 8;
            ctx.strokeRect(qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2 + 22);
            ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

            ctx.fillStyle = CERT_COLORS.muted;
            ctx.font = `600 11px ${CERT_FONT_SANS}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Scan to Verify", qrX + qrSize / 2, qrY + qrSize + 12);
        }

        // Full "bake" used for the visible working canvas, PDF export, and any
        // other high-DPI output. Renders the decorative background plus every
        // editable field (using the live edit-state values) plus the QR code.
        async function renderCertificateOntoCanvas(cert, options = {}) {
            if (!cert) {
                throw new Error("Select an issued certificate to render.");
            }

            await ensureExportLibraries();

            const canvas = document.getElementById('certWorkCanvas');
            if (!canvas) throw new Error("Certificate canvas not found.");

            const editState = ensureCertEditStateForCert(cert);
            // Capture live overlay edits (including static labels) before baking PDF/PNG.
            syncCertEditStateFromOverlay();
            Object.assign(editState, certEditState);
            const scale = options.scale || CERT_EXPORT_SCALE;
            const width = CERT_BASE_WIDTH;
            const height = CERT_BASE_HEIGHT;
            const pixelW = Math.round(width * scale);
            const pixelH = Math.round(height * scale);

            canvas.width = pixelW;
            canvas.height = pixelH;

            const ctx = canvas.getContext("2d");
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.clearRect(0, 0, width, height);

            // Layer order: decorative frame FIRST, then all text on top, then QR.
            await drawPremiumCertificateBackground(ctx, width, height, cert, editState.certType);
            drawCertificateEditableFields(ctx, width, height, editState);
            const qrSerial = String(editState.serialNo || cert.certificate_id || "").trim().toUpperCase();
            await drawCertificateQrBlock(ctx, width, height, qrSerial);

            certLastRenderedDataUrl = canvas.toDataURL("image/png", 1.0);
            return certLastRenderedDataUrl;
        }

        // Lightweight background-only render (no editable text baked in) used
        // strictly to back the live HTML overlay while the admin is editing —
        // keeps typing instant since we never need to redraw text on canvas
        // during keystrokes.
        async function renderCertificateBackgroundOnly(cert, certType) {
            await ensureExportLibraries();
            const scale = 2;
            const canvas = document.createElement("canvas");
            canvas.width = CERT_BASE_WIDTH * scale;
            canvas.height = CERT_BASE_HEIGHT * scale;
            const ctx = canvas.getContext("2d");
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.clearRect(0, 0, CERT_BASE_WIDTH, CERT_BASE_HEIGHT);

            await drawPremiumCertificateBackground(ctx, CERT_BASE_WIDTH, CERT_BASE_HEIGHT, cert, certType);
            const qrSerial = String(certEditState.serialNo || cert.certificate_id || "").trim().toUpperCase();
            await drawCertificateQrBlock(ctx, CERT_BASE_WIDTH, CERT_BASE_HEIGHT, qrSerial);
            return canvas.toDataURL("image/png", 1.0);
        }

        // =====================================================================
        // Absolute contenteditable overlay — original frame grid + safe wrap
        // =====================================================================
        function updateCertNameUnderline(text) {
            const underline = document.getElementById("certNameUnderline");
            if (!underline) return;
            const ctx = getCertMeasureCtx();
            const def = CERT_TEXT_LAYOUT.find((d) => d.field === "studentName");
            const raw = String(text || "").trim() || def.placeholder;
            const size = fitTextToWidth(ctx, raw, def.maxWidth, def.size, def.minSize, def.font, def.weight);
            ctx.font = `${def.weight} ${size}px ${def.font}`;
            const w = Math.min(ctx.measureText(raw).width + 20, def.maxWidth);
            const leftPct = ((def.x - w / 2) / CERT_BASE_WIDTH) * 100;
            const widthPct = (w / CERT_BASE_WIDTH) * 100;
            underline.style.left = `${leftPct}%`;
            underline.style.width = `${widthPct}%`;
            underline.style.top = `${(356 / CERT_BASE_HEIGHT) * 100}%`;
        }

        function handleCertFieldInput(field, el) {
            let text = (el.innerText || "").replace(/\s*\n\s*/g, " ").trim();
            if (field === "serialNo") text = text.toUpperCase();
            if (field === "courseName") text = text.replace(/^[\u201C"']+|[\u201D"']+$/g, "").trim();
            certEditState[field] = text;
            if (field === "studentName") updateCertNameUnderline(text);
            if (field === "issueDateText") {
                const iso = toDateInputValue(text) || parseFlexibleDate(text);
                const issueInput = document.getElementById("admCertIssueDate");
                if (iso && issueInput) issueInput.value = iso;
            }
        }

        function syncCertEditStateFromOverlay() {
            const stage = document.getElementById("certOverlayStage");
            if (!stage) return certEditState;
            stage.querySelectorAll(".cert-edit-field[data-field]").forEach((el) => {
                const field = el.dataset.field;
                if (!field) return;
                let text = (el.innerText || el.textContent || "").replace(/\s*\n\s*/g, " ").trim();
                if (field === "serialNo") text = text.toUpperCase();
                if (field === "courseName") text = text.replace(/^[\u201C"']+|[\u201D"']+$/g, "").trim();
                certEditState[field] = text;
            });
            return certEditState;
        }

        function parseFatherNameFromCanvasLine(line) {
            return String(line || "")
                .replace(/^s\s*\/\s*o\s+/i, "")
                .replace(/^d\s*\/\s*o\s+/i, "")
                .replace(/^w\s*\/\s*o\s+/i, "")
                .trim();
        }

        function clearVerifyLookupCache() {
            try { sessionStorage.removeItem(VERIFY_RATE_STORAGE_KEY); } catch (_) { /* ignore */ }
            const resultCard = document.getElementById("verifyResultCard");
            if (resultCard) {
                resultCard.innerHTML = "";
                resultCard.classList.remove("show", "loading", "success", "error");
            }
        }

        async function saveCertificateCanvasEdits(event) {
            const triggerBtn = resolveEventButton(event) || document.getElementById("saveCertCanvasEditsBtn");
            if (!(await requireAdminSession())) return;
            const cert = getSelectedCertificateForRender();
            if (!cert?.id) {
                showToast("⚠️ Open a certificate preview before saving canvas edits.", "warning");
                return;
            }
            syncCertEditStateFromOverlay();
            const layoutPayload = getCanvasLayoutPayload(certEditState);
            const studentName = String(certEditState.studentName || "").trim();
            const fatherFromCanvas = parseFatherNameFromCanvasLine(certEditState.fatherLine);
            const fatherName = fatherFromCanvas || String(cert.father_name || "").trim();
            const courseName = String(certEditState.courseName || "").trim();
            let gradeRaw = String(certEditState.credits || "").trim();
            if (!gradeRaw || gradeRaw === "—" || gradeRaw === "-") gradeRaw = "";
            const issueIso = parseFlexibleDate(certEditState.issueDateText)
                || toDateInputValue(certEditState.issueDateText)
                || toDateInputValue(cert.issue_date)
                || cert.issue_date;
            const originalSerial = String(cert.certificate_id || "").trim().toUpperCase();
            const editedSerial = String(certEditState.serialNo || "").trim().toUpperCase() || originalSerial;
            if (!studentName || !courseName || !issueIso) {
                showToast("⚠️ Student name, course, and issue date are required.", "warning");
                return;
            }
            const updatePayload = {
                certificate_id: editedSerial && editedSerial !== originalSerial ? editedSerial : originalSerial,
                student_name: studentName,
                father_name: fatherName,
                course_name: courseName,
                grade: gradeRaw || null,
                issue_date: issueIso,
                status: cert.status || "active",
                canvas_layout: layoutPayload
            };
            setButtonLoading(triggerBtn, true, "Saving…");
            if (triggerBtn) triggerBtn.classList.add("is-loading");
            try {
                let { data, error } = await supabaseClient
                    .from("certificates")
                    .update(updatePayload)
                    .eq("id", cert.id)
                    .select("id, certificate_id, student_name, father_name, course_name, issue_date, grade, status, student_id, course_id, expiry_date, student_dob, canvas_layout")
                    .maybeSingle();
                if (error && /canvas_layout|column/i.test(String(error.message || ""))) {
                    delete updatePayload.canvas_layout;
                    ({ data, error } = await supabaseClient
                        .from("certificates")
                        .update(updatePayload)
                        .eq("id", cert.id)
                        .select("id, certificate_id, student_name, father_name, course_name, issue_date, grade, status, student_id, course_id")
                        .maybeSingle());
                }
                if ((!data || error) && originalSerial) {
                    ({ data, error } = await supabaseClient
                        .from("certificates")
                        .update(updatePayload)
                        .eq("certificate_id", originalSerial)
                        .select("id, certificate_id, student_name, father_name, course_name, issue_date, grade, status, student_id, course_id")
                        .maybeSingle());
                }
                if (error || !data) {
                    showToast(`⚠️ Could not save canvas edits: ${error?.message || "No row updated."}`, "warning");
                    return;
                }
                const idx = adminCache.certificates.findIndex((c) => c.id === cert.id);
                const merged = { ...(idx >= 0 ? adminCache.certificates[idx] : {}), ...data, canvas_layout: data.canvas_layout || layoutPayload };
                if (idx >= 0) adminCache.certificates[idx] = merged;
                else adminCache.certificates.unshift(merged);
                selectedCertRenderId = data.id;
                certEditStateCertId = data.id;
                Object.assign(certEditState, layoutPayload);
                certEditState.serialNo = String(data.certificate_id || "").toUpperCase();
                certEditState.studentName = data.student_name || studentName;
                certEditState.fatherLine = data.father_name ? `S/O ${data.father_name}` : certEditState.fatherLine;
                certEditState.courseName = data.course_name || courseName;
                certEditState.issueDateText = formatCanvasDate(data.issue_date || issueIso);
                certEditState.credits = data.grade || gradeRaw || "—";
                const fatherInput = document.getElementById("admCertFather");
                if (fatherInput) fatherInput.value = data.father_name || fatherName;
                const gradeInput = document.getElementById("admCertGrade");
                if (gradeInput) gradeInput.value = data.grade || gradeRaw || "";
                const issueInput = document.getElementById("admCertIssueDate");
                if (issueInput) issueInput.value = toDateInputValue(data.issue_date) || issueIso;
                const idInput = document.getElementById("admCertId");
                if (idInput) idInput.value = String(data.certificate_id || "").toUpperCase();
                buildOrUpdateCertOverlayFields(certEditState);
                renderAdminCertificatesTable();
                clearVerifyLookupCache();

                // Re-bake preview QR with the latest deep-link serial URL.
                try {
                    const stage = document.getElementById("certOverlayStage");
                    if (stage && !stage.hidden) {
                        await refreshCertPreviewBackground();
                    }
                    const mergedCert = adminCache.certificates.find((c) => c.id === data.id) || merged;
                    await renderCertificateOntoCanvas(mergedCert, { scale: 1 });
                } catch (qrErr) {
                    console.warn("[Certificates] QR refresh after canvas save skipped:", qrErr);
                }

                showToast("Certificate updated in database!", "success");
                await logAdminActivity("certificate_canvas_updated", "certificates", { id: data.id, certificate_id: data.certificate_id });
            } catch (err) {
                console.error("[Certificates] Canvas save crashed:", err);
                showToast(`⚠️ Could not save canvas edits: ${err.message || err}`, "warning");
            } finally {
                setButtonLoading(triggerBtn, false);
                if (triggerBtn) triggerBtn.classList.remove("is-loading");
            }
        }

        function handleCertFieldPaste(event) {
            event.preventDefault();
            const text = (event.clipboardData || window.clipboardData).getData("text/plain").replace(/\s*\n\s*/g, " ");
            try { document.execCommand("insertText", false, text); }
            catch (err) { event.target.textContent += text; }
        }

        function ensureCertOverlayResizeObserver() {
            const stage = document.getElementById("certOverlayStage");
            if (!stage || typeof ResizeObserver === "undefined") return;
            if (certOverlayResizeObserver) certOverlayResizeObserver.disconnect();
            certOverlayResizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const w = entry.contentRect.width;
                    if (w > 0) stage.style.setProperty("--cert-scale", String(w / CERT_BASE_WIDTH));
                }
            });
            certOverlayResizeObserver.observe(stage);
        }

        function buildOrUpdateCertOverlayFields(editState) {
            const stage = document.getElementById("certOverlayStage");
            if (!stage) return;
            stage.querySelectorAll("#certificate-preview, .cert-doc").forEach((el) => el.remove());
            let fields = stage.querySelectorAll(".cert-edit-field");
            if (!fields.length || fields.length !== CERT_TEXT_LAYOUT.length) {
                stage.querySelectorAll(".cert-edit-field, #certNameUnderline").forEach((el) => el.remove());
                CERT_TEXT_LAYOUT.forEach((def) => {
                    const el = document.createElement("div");
                    el.className = "cert-edit-field";
                    if (def.maxLines > 1) el.classList.add("cert-edit-multiline");
                    if (def.field === "courseName") el.classList.add("cert-edit-course");
                    if (def.field === "studentName") el.classList.add("cert-edit-student");
                    el.contentEditable = "true";
                    el.spellcheck = false;
                    el.dataset.field = def.field;
                    el.dataset.placeholder = def.placeholder || "";
                    el.setAttribute("role", "textbox");
                    el.setAttribute("aria-label", def.placeholder || def.field);
                    el.style.left = `${(def.x / CERT_BASE_WIDTH) * 100}%`;
                    el.style.top = `${(def.y / CERT_BASE_HEIGHT) * 100}%`;
                    el.style.maxWidth = `${(def.maxWidth / CERT_BASE_WIDTH) * 100}%`;
                    el.style.textAlign = def.align;
                    el.style.color = def.color;
                    el.style.fontFamily = def.font;
                    el.style.fontWeight = def.weight;
                    el.style.fontStyle = def.italic ? "italic" : "normal";
                    el.style.transform = def.align === "left"
                        ? "translate(0, -50%)"
                        : def.align === "right"
                            ? "translate(-100%, -50%)"
                            : "translate(-50%, -50%)";
                    el.style.setProperty("--f", def.size);
                    el.addEventListener("input", () => handleCertFieldInput(def.field, el));
                    el.addEventListener("paste", handleCertFieldPaste);
                    el.addEventListener("keydown", (e) => {
                        if (e.key === "Enter" && !(def.maxLines > 1)) e.preventDefault();
                    });
                    stage.appendChild(el);
                });
                const underline = document.createElement("div");
                underline.id = "certNameUnderline";
                underline.className = "cert-name-underline";
                stage.appendChild(underline);
                fields = stage.querySelectorAll(".cert-edit-field");
            }
            fields.forEach((el) => {
                const field = el.dataset.field;
                el.textContent = editState[field] || "";
            });
            updateCertNameUnderline(editState.studentName);
            ensureCertOverlayResizeObserver();
        }

        function setCertificateType(type) {
            const normalized = type === "appreciation" ? "appreciation" : "completion";
            const prevType = certEditState.certType;
            certEditState.certType = normalized;
            syncCertTypeToggleUI(normalized);
            const prevSub = prevType === "appreciation" ? CERT_DEFAULT_COPY.titleSubAppreciation : CERT_DEFAULT_COPY.titleSubCompletion;
            const prevBody = prevType === "appreciation" ? CERT_DEFAULT_COPY.bodyAppreciation : CERT_DEFAULT_COPY.bodyCompletion;
            const nextSub = normalized === "appreciation" ? CERT_DEFAULT_COPY.titleSubAppreciation : CERT_DEFAULT_COPY.titleSubCompletion;
            const nextBody = normalized === "appreciation" ? CERT_DEFAULT_COPY.bodyAppreciation : CERT_DEFAULT_COPY.bodyCompletion;
            if (!certEditState.titleSub || certEditState.titleSub === prevSub) certEditState.titleSub = nextSub;
            if (!certEditState.bodyLine || certEditState.bodyLine === prevBody) certEditState.bodyLine = nextBody;
            const stage = document.getElementById("certOverlayStage");
            if (stage && !stage.hidden) buildOrUpdateCertOverlayFields(certEditState);
            refreshCertPreviewBackground();
        }

        function syncCertTypeToggleUI(type) {
            const btnCompletion = document.getElementById("certTypeBtnCompletion");
            const btnAppreciation = document.getElementById("certTypeBtnAppreciation");
            if (btnCompletion) btnCompletion.classList.toggle("active", type !== "appreciation");
            if (btnAppreciation) btnAppreciation.classList.toggle("active", type === "appreciation");
        }

        async function refreshCertPreviewBackground() {
            const cert = getSelectedCertificateForRender();
            const previewImg = document.getElementById("certPreviewImage");
            const stage = document.getElementById("certOverlayStage");
            if (!cert || !previewImg || !stage || stage.hidden) return;
            try {
                previewImg.src = await renderCertificateBackgroundOnly(cert, certEditState.certType);
            } catch (err) {
                console.error(err);
                showToast(`⚠️ Could not refresh preview: ${err.message || err}`, "warning");
            }
        }

        async function openCertificatePreview(event) {
            const triggerBtn = resolveEventButton(event) || document.getElementById('previewCertBtn');
            const stage = document.getElementById('certOverlayStage');
            const placeholder = document.getElementById('certPreviewPlaceholder');

            try {
                const cert = getSelectedCertificateForRender();
                if (!cert) {
                    showToast("Issue a certificate for the selected student first, then preview.", "warning");
                    return;
                }

                setButtonLoading(triggerBtn, true, "Rendering…");
                setCertificatePreviewLoading(true);
                document.getElementById('certificatePreviewModal')?.classList.add('open');

                const editState = ensureCertEditStateForCert(cert);
                syncCertTypeToggleUI(editState.certType);

                const bgDataUrl = await renderCertificateBackgroundOnly(cert, editState.certType);
                const previewImg = document.getElementById('certPreviewImage');
                if (previewImg) previewImg.src = bgDataUrl;

                // Also refresh the inline studio canvas preview strip
                try {
                    await renderCertificateOntoCanvas(cert, { scale: 1 });
                } catch (canvasErr) {
                    console.warn("[Cert] Inline canvas refresh skipped:", canvasErr);
                }

                if (stage) stage.hidden = false;
                buildOrUpdateCertOverlayFields(editState);

                if (placeholder) {
                    placeholder.hidden = true;
                    placeholder.textContent = "Generate a preview to review the overlay layout.";
                }
            } catch (err) {
                console.error(err);
                showToast(`⚠️ Preview failed: ${err.message || err}`, "warning");
                if (stage) stage.hidden = true;
                if (placeholder) {
                    placeholder.hidden = false;
                    placeholder.textContent = "Preview failed. Please try again.";
                }
            } finally {
                setCertificatePreviewLoading(false);
                setButtonLoading(triggerBtn, false);
            }
        }

        function closeCertificatePreviewModal() {
            document.getElementById('certificatePreviewModal')?.classList.remove('open');
        }

        function closeCertificatePreviewOnOverlay(event) {
            if (event.target.id === 'certificatePreviewModal') {
                closeCertificatePreviewModal();
            }
        }

        async function downloadCertificatePdf(event) {
            const triggerBtn = resolveEventButton(event)
                || document.getElementById('downloadCertPdfModalBtn')
                || document.getElementById('downloadCertPdfBtn');
            try {
                const cert = getSelectedCertificateForRender();
                if (!cert) {
                    showToast("Issue a certificate for the selected student first, then download.", "warning");
                    return;
                }

                const { JsPDF } = await ensureExportLibraries();
                if (typeof JsPDF !== "function") {
                    showToast("⚠️ jsPDF library failed to load. Refresh and try again.", "warning");
                    return;
                }

                setButtonLoading(triggerBtn, true, "Building PDF…");
                showToast("📄 Building high-resolution PDF…", "info");
                const dataUrl = await renderCertificateOntoCanvas(cert, { scale: CERT_EXPORT_SCALE });

                const pdf = new JsPDF({
                    orientation: "landscape",
                    unit: "pt",
                    format: "a4",
                    compress: true
                });

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                pdf.addImage(dataUrl, "PNG", 0, 0, pageWidth, pageHeight, undefined, "NONE");
                pdf.save(`${cert.certificate_id || "certificate"}.pdf`);
                showToast("✅ High-res PDF downloaded.", "success");
                await logAdminActivity('certificate_pdf_exported', 'certificates', {
                    certificate_id: cert.certificate_id
                });
            } catch (err) {
                console.error(err);
                showToast(`⚠️ PDF export failed: ${err.message || err}`, "warning");
            } finally {
                setButtonLoading(triggerBtn, false);
            }
        }

let authListenerBound = false;

        async function initAdminSessionRetention() {
            const ctx = getAppContext();

            // Public multi-page portal never mounts the SPA admin shell.
            if (ctx.isPublic || ctx.isAdminLogin) {
                syncAuthChrome(false);
                markAuthResolved();
                return;
            }

            // Always start from the pristine public chrome until session is proven.
            syncAuthChrome(false);

            if (!supabaseClient) {
                markAuthResolved();
                if (ctx.isAdminDashboard) {
                    window.location.href = getAdminLoginHref();
                }
                return;
            }

            try {
                const { data, error } = await supabaseClient.auth.getSession();
                if (error) {
                    console.error('Session lookup error:', error);
                    syncAuthChrome(false);
                    markAuthResolved();
                    if (ctx.isAdminDashboard) {
                        window.location.href = getAdminLoginHref();
                    }
                    return;
                }

                const session = data?.session || null;
                if (session?.user) {
                    await enterAdminDashboard(session.user);
                } else {
                    syncAuthChrome(false);
                    markAuthResolved();
                    if (ctx.isAdminDashboard) {
                        window.location.href = getAdminLoginHref();
                    }
                }

                if (!authListenerBound) {
                    authListenerBound = true;
                    supabaseClient.auth.onAuthStateChange(async (event, nextSession) => {
                        if (event === 'INITIAL_SESSION') return;

                        if (event === 'SIGNED_OUT' || !nextSession?.user) {
                            exitAdminDashboard();
                            return;
                        }

                        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                            if (nextSession?.user && !document.body.classList.contains('admin-session')) {
                                await enterAdminDashboard(nextSession.user);
                            } else if (nextSession?.user) {
                                adminSessionUser = nextSession.user;
                                const emailLabel = document.getElementById('adminNavEmail');
                                if (emailLabel) emailLabel.textContent = nextSession.user.email || "Administrator";
                            }
                        }
                    });
                }
            } catch (err) {
                console.error('Admin session init failed:', err);
                syncAuthChrome(false);
                markAuthResolved();
                if (ctx.isAdminDashboard) {
                    window.location.href = getAdminLoginHref();
                }
            }
        }

        // =====================================================================
        // Public Reviews (realtime) + Admin Moderation
        // =====================================================================
        let publicReviewsCache = [];
        let reviewsRealtimeBound = false;

        function starsMarkup(rating) {
            const n = Math.max(1, Math.min(5, Number(rating) || 5));
            return `<div class="review-stars" aria-label="${n} out of 5 stars">${"★".repeat(n)}${"☆".repeat(5 - n)}</div>`;
        }

        function renderPublicReviewsSlider(reviews) {
            const slider = document.getElementById("publicReviewsSlider");
            const dots = document.getElementById("publicReviewsDots");
            if (!slider) return;
            const list = Array.isArray(reviews) ? reviews : [];
            if (!list.length) {
                slider.innerHTML = `<div class="testimonial-slide active">
                    <p class="testimonial-text">Be the first to share your experience at The Spectrum Institute.</p>
                    <div class="testimonial-user">TSI Community</div>
                    <div class="testimonial-course">Barikot &amp; Mingora, Swat</div>
                </div>`;
                if (dots) dots.innerHTML = "";
                return;
            }
            slider.innerHTML = list.map((r, i) => `
                <div class="testimonial-slide${i === 0 ? " active" : ""}">
                    ${starsMarkup(r.rating)}
                    <p class="testimonial-text">"${escapeHtml(r.review_text)}"</p>
                    <div class="testimonial-user">${escapeHtml(r.student_name)}</div>
                    <div class="testimonial-course">${escapeHtml(formatDisplayDate(r.created_at))}</div>
                </div>
            `).join("");
            if (dots) {
                dots.innerHTML = list.map((_, i) =>
                    `<div class="slider-dot${i === 0 ? " active" : ""}" onclick="setTestimonial(${i})"></div>`
                ).join("");
            }
        }

        async function fetchPublicReviews() {
            if (!supabaseClient) return [];
            const { data, error } = await supabaseClient
                .from("reviews")
                .select("id, student_name, rating, review_text, is_approved, created_at")
                .eq("is_approved", true)
                .order("created_at", { ascending: false })
                .limit(40);
            if (error) {
                console.warn("[Reviews] public fetch failed:", error);
                return [];
            }
            return data || [];
        }

        async function initPublicReviewsModule() {
            if (!document.getElementById("publicReviewsSlider")) return;
            publicReviewsCache = await fetchPublicReviews();
            renderPublicReviewsSlider(publicReviewsCache);
            if (!supabaseClient || reviewsRealtimeBound) return;
            try {
                reviewsRealtimeBound = true;
                supabaseClient
                    .channel("public-reviews")
                    .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, async () => {
                        publicReviewsCache = await fetchPublicReviews();
                        renderPublicReviewsSlider(publicReviewsCache);
                    })
                    .subscribe();
            } catch (err) {
                console.warn("[Reviews] realtime subscribe skipped:", err);
            }
        }

        function openAddReviewModal() {
            document.getElementById("addReviewModal")?.classList.add("open");
        }
        function closeAddReviewModal() {
            document.getElementById("addReviewModal")?.classList.remove("open");
        }
        function closeAddReviewOnOverlay(event) {
            if (event.target.id === "addReviewModal") closeAddReviewModal();
        }

        async function handlePublicReviewSubmit(event) {
            event.preventDefault();
            if (!requireSupabaseClient()) return;
            const name = sanitizeInput(document.getElementById("reviewStudentName")?.value, { maxLength: 80 });
            const rating = Number(document.getElementById("reviewRating")?.value || 5);
            const reviewText = sanitizeInput(document.getElementById("reviewText")?.value, { maxLength: 600, allowNewlines: true });
            if (!name || name.length < 2 || !reviewText || reviewText.length < 5) {
                showToast("⚠️ Please enter your name and a short review.", "warning");
                return;
            }
            const { error } = await supabaseClient.from("reviews").insert({
                student_name: name,
                rating: Math.max(1, Math.min(5, rating)),
                review_text: reviewText,
                is_approved: true
            });
            if (error) {
                console.error(error);
                showToast(`⚠️ Could not submit review: ${error.message}`, "warning");
                return;
            }
            event.target.reset();
            closeAddReviewModal();
            showToast("✅ Thank you! Your review is live.", "success");
            publicReviewsCache = await fetchPublicReviews();
            renderPublicReviewsSlider(publicReviewsCache);
        }

        function renderAdminReviewsTable() {
            const body = document.getElementById("adminReviewsBody");
            if (!body) return;
            if (!adminCache.reviews.length) {
                body.innerHTML = `<tr><td colspan="5" class="admin-table-empty">No reviews yet.</td></tr>`;
                return;
            }
            body.innerHTML = adminCache.reviews.map((r) => {
                const safeId = escapeJsString(r.id);
                return `<tr>
                    <td>${escapeHtml(r.student_name)}</td>
                    <td>${starsMarkup(r.rating)}</td>
                    <td>${escapeHtml(r.review_text)}</td>
                    <td>${escapeHtml(formatDisplayDate(r.created_at))}</td>
                    <td><button type="button" class="admin-action-btn" onclick="deleteAdminReview('${safeId}')">🗑️ Delete Review</button></td>
                </tr>`;
            }).join("");
        }

        async function deleteAdminReview(reviewId) {
            if (!(await requireAdminSession())) return;
            if (!window.confirm("Permanently delete this review?")) return;
            const { error } = await supabaseClient.from("reviews").delete().eq("id", reviewId);
            if (error) {
                showToast(`⚠️ Could not delete review: ${error.message}`, "warning");
                return;
            }
            adminCache.reviews = adminCache.reviews.filter((r) => r.id !== reviewId);
            renderAdminReviewsTable();
            showToast("✅ Review deleted.", "success");
            await logAdminActivity("review_deleted", "reviews", { id: reviewId });
        }

        // =====================================================================
        // Alumni Directory (public + admin CRUD)
        // =====================================================================
        function alumniInitials(name) {
            return String(name || "A")
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase() || "")
                .join("") || "A";
        }

        function renderPublicAlumniDirectory(rows) {
            const grid = document.getElementById("alumniDirectoryGrid");
            if (!grid) return;
            const list = Array.isArray(rows) ? rows : [];
            if (!list.length) {
                grid.innerHTML = `<p class="alumni-empty">Alumni stories will appear here once published by the institute.</p>`;
                return;
            }
            grid.innerHTML = list.map((a) => {
                const photo = a.image_url
                    ? `<div class="alumni-card-photo"><img src="${escapeHtml(a.image_url)}" alt="${escapeHtml(a.student_name)}" loading="lazy"></div>`
                    : `<div class="alumni-card-photo" aria-hidden="true">${escapeHtml(alumniInitials(a.student_name))}</div>`;
                return `<article class="alumni-card reveal-on-scroll">
                    ${photo}
                    <h3>${escapeHtml(a.student_name)}</h3>
                    <div class="alumni-meta">Batch ${escapeHtml(a.batch_year)} · ${escapeHtml(a.course_title)}</div>
                    <div class="alumni-role">${escapeHtml(a.job_title)}</div>
                    <p>${escapeHtml(a.achievement_story)}</p>
                </article>`;
            }).join("");
            initScrollRevealAnimations();
        }

        async function initPublicAlumniDirectory() {
            if (!document.getElementById("alumniDirectoryGrid") || !supabaseClient) return;
            const { data, error } = await supabaseClient
                .from("alumni")
                .select("id, student_name, batch_year, course_title, job_title, achievement_story, image_url, created_at")
                .order("created_at", { ascending: false });
            if (error) {
                console.warn("[Alumni] public fetch failed:", error);
                renderPublicAlumniDirectory([]);
                return;
            }
            renderPublicAlumniDirectory(data || []);
            try {
                supabaseClient
                    .channel("public-alumni")
                    .on("postgres_changes", { event: "*", schema: "public", table: "alumni" }, async () => {
                        const again = await supabaseClient
                            .from("alumni")
                            .select("id, student_name, batch_year, course_title, job_title, achievement_story, image_url, created_at")
                            .order("created_at", { ascending: false });
                        renderPublicAlumniDirectory(again.data || []);
                    })
                    .subscribe();
            } catch (err) {
                console.warn("[Alumni] realtime subscribe skipped:", err);
            }
        }

        function renderAdminAlumniTable() {
            const body = document.getElementById("adminAlumniBody");
            if (!body) return;
            if (!adminCache.alumni.length) {
                body.innerHTML = `<tr><td colspan="6" class="admin-table-empty">No alumni cards yet. Click Add New Alumni.</td></tr>`;
                return;
            }
            body.innerHTML = adminCache.alumni.map((a) => {
                const safeId = escapeJsString(a.id);
                const thumb = a.image_url
                    ? `<img class="admin-alumni-thumb" src="${escapeHtml(a.image_url)}" alt="">`
                    : `<span class="admin-alumni-thumb" style="display:inline-flex;align-items:center;justify-content:center;background:rgba(0,229,255,.08);">${escapeHtml(alumniInitials(a.student_name))}</span>`;
                return `<tr>
                    <td>${thumb}</td>
                    <td>${escapeHtml(a.student_name)}</td>
                    <td>${escapeHtml(a.batch_year)}</td>
                    <td>${escapeHtml(a.course_title)}</td>
                    <td>${escapeHtml(a.job_title)}</td>
                    <td>
                        <button type="button" class="admin-action-btn" onclick="beginEditAlumni('${safeId}')">✏️ Edit</button>
                        <button type="button" class="admin-action-btn" onclick="deleteAdminAlumni('${safeId}')">🗑️ Delete</button>
                    </td>
                </tr>`;
            }).join("");
        }

        function openAlumniFormModal(alumni = null) {
            const modal = document.getElementById("alumniFormModal");
            const title = document.getElementById("alumniFormTitle");
            const hidden = document.getElementById("editingAlumniId");
            if (!modal) return;
            if (title) title.textContent = alumni ? "Edit Alumni" : "Add New Alumni";
            if (hidden) hidden.value = alumni?.id || "";
            document.getElementById("admAlumniName").value = alumni?.student_name || "";
            document.getElementById("admAlumniBatch").value = alumni?.batch_year || "";
            document.getElementById("admAlumniCourse").value = alumni?.course_title || "";
            document.getElementById("admAlumniRole").value = alumni?.job_title || "";
            document.getElementById("admAlumniStory").value = alumni?.achievement_story || "";
            document.getElementById("admAlumniImage").value = alumni?.image_url || "";
            modal.classList.add("open");
        }

        function closeAlumniFormModal() {
            document.getElementById("alumniFormModal")?.classList.remove("open");
            const form = document.getElementById("adminAlumniForm");
            if (form) form.reset();
            const hidden = document.getElementById("editingAlumniId");
            if (hidden) hidden.value = "";
        }

        function closeAlumniFormOnOverlay(event) {
            if (event.target.id === "alumniFormModal") closeAlumniFormModal();
        }

        function beginEditAlumni(alumniId) {
            const row = adminCache.alumni.find((a) => a.id === alumniId);
            if (!row) {
                showToast("⚠️ Alumni record not found.", "warning");
                return;
            }
            openAlumniFormModal(row);
        }

        async function handleAdminSaveAlumni(event) {
            event.preventDefault();
            if (!(await requireAdminSession())) return;
            const editingId = document.getElementById("editingAlumniId")?.value || "";
            const payload = {
                student_name: sanitizeInput(document.getElementById("admAlumniName")?.value, { maxLength: 120 }),
                batch_year: sanitizeInput(document.getElementById("admAlumniBatch")?.value, { maxLength: 40 }),
                course_title: sanitizeInput(document.getElementById("admAlumniCourse")?.value, { maxLength: 150 }),
                job_title: sanitizeInput(document.getElementById("admAlumniRole")?.value, { maxLength: 180 }),
                achievement_story: sanitizeInput(document.getElementById("admAlumniStory")?.value, { maxLength: 1200, allowNewlines: true }),
                image_url: sanitizeInput(document.getElementById("admAlumniImage")?.value, { maxLength: 500 }) || null
            };
            if (!payload.student_name || !payload.batch_year || !payload.course_title || !payload.job_title || !payload.achievement_story) {
                showToast("⚠️ Please complete all required alumni fields.", "warning");
                return;
            }
            const btn = document.getElementById("admAlumniSubmitBtn");
            setButtonLoading(btn, true, "Saving…");
            try {
                let error = null;
                if (editingId) {
                    ({ error } = await supabaseClient.from("alumni").update(payload).eq("id", editingId));
                } else {
                    ({ error } = await supabaseClient.from("alumni").insert(payload));
                }
                if (error) {
                    showToast(`⚠️ Could not save alumni: ${error.message}`, "warning");
                    return;
                }
                closeAlumniFormModal();
                showToast(editingId ? "✅ Alumni updated." : "✅ Alumni added.", "success");
                await refreshAdminDashboard();
                await logAdminActivity(editingId ? "alumni_updated" : "alumni_created", "alumni", { id: editingId || null, student_name: payload.student_name });
            } finally {
                setButtonLoading(btn, false);
            }
        }

        async function deleteAdminAlumni(alumniId) {
            if (!(await requireAdminSession())) return;
            if (!window.confirm("Delete this alumni card permanently?")) return;
            const { error } = await supabaseClient.from("alumni").delete().eq("id", alumniId);
            if (error) {
                showToast(`⚠️ Could not delete alumni: ${error.message}`, "warning");
                return;
            }
            adminCache.alumni = adminCache.alumni.filter((a) => a.id !== alumniId);
            renderAdminAlumniTable();
            showToast("✅ Alumni deleted.", "success");
            await logAdminActivity("alumni_deleted", "alumni", { id: alumniId });
        }

        document.addEventListener('DOMContentLoaded', async () => {
            const ctx = getAppContext();
            initThemePreference();
            initMobileNav();
            initFormEnterNavigation();
            initMobileFormFocusScroll();
            initScrollRevealAnimations();

            if (ctx.isPublic) {
                document.body.classList.remove('auth-resolving');
                bindSecretAdminTriggers();
                initPublicSecurityHardening();
                updateVerifyRateHint();
                checkUrlForVerifyParam();
                await initApplyOnlineCourseSelects();
                initTeacherSlideshow();
                await initPublicReviewsModule();
                await initPublicAlumniDirectory();
                return;
            }

            if (ctx.isAdminLogin) {
                // Login flow is owned by js/admin-auth.js
                document.body.classList.remove('auth-resolving');
                initThemePreference();
                return;
            }

            if (ctx.isAdminDashboard) {
                // Prefer the session already validated by admin-auth.js
                document.addEventListener('tsi:admin-ready', async (event) => {
                    await enterAdminDashboard(event.detail?.user || window.__tsiAdminUser);
                }, { once: true });

                if (window.__tsiAdminUser) {
                    await enterAdminDashboard(window.__tsiAdminUser);
                } else {
                    await initAdminSessionRetention();
                }

                const issueDateInput = document.getElementById('admCertIssueDate');
                if (issueDateInput) {
                    if (!issueDateInput.value) issueDateInput.value = getLocalDateISO();
                    issueDateInput.addEventListener('change', () => {
                        const iso = toDateInputValue(issueDateInput.value) || issueDateInput.value;
                        if (iso) {
                            issueDateInput.value = iso;
                            certEditState.issueDateText = formatCanvasDate(iso);
                            const overlayField = document.querySelector('.cert-edit-field[data-field="issueDateText"]');
                            if (overlayField) overlayField.textContent = certEditState.issueDateText;
                        }
                    });
                }

                const certIdInput = document.getElementById('admCertId');
                if (certIdInput) {
                    certIdInput.addEventListener('input', () => {
                        if (!isCertIdAutoMode()) {
                            checkManualCertIdDuplicate();
                        }
                    });
                }

                setCertIdMode(true);
            }
        });

        // =====================================================================
        // Hero Faculty Slideshow — DOM / markup-driven (edit slides in index.html)
        // =====================================================================
        let activeTeacherIndex = 0;
        let teacherSlideTimer = null;
        const TEACHER_SLIDE_MS = 3500;

        function getFacultySlides() {
            return Array.from(document.querySelectorAll("#teacherSlideshow .faculty-slide"));
        }

        function setTeacherSlide(index) {
            const slides = getFacultySlides();
            if (!slides.length) return;

            const next = ((index % slides.length) + slides.length) % slides.length;
            activeTeacherIndex = next;

            slides.forEach((slide, i) => {
                slide.classList.toggle("active", i === next);
            });

            document.querySelectorAll("#teacherSlideDots .t-dot").forEach((dot, i) => {
                const isActive = i === next;
                dot.classList.toggle("active", isActive);
                dot.setAttribute("aria-selected", isActive ? "true" : "false");
            });

            restartTeacherSlideshow();
        }

        function advanceTeacherSlide() {
            setTeacherSlide(activeTeacherIndex + 1);
        }

        function restartTeacherSlideshow() {
            if (teacherSlideTimer) clearInterval(teacherSlideTimer);
            teacherSlideTimer = setInterval(advanceTeacherSlide, TEACHER_SLIDE_MS);
        }

        function initTeacherSlideshow() {
            const root = document.getElementById("teacherSlideshow");
            const dotsWrap = document.getElementById("teacherSlideDots");
            const slides = getFacultySlides();
            if (!root || !dotsWrap || !slides.length) return;

            dotsWrap.innerHTML = slides.map((_, i) =>
                `<button type="button" class="t-dot${i === 0 ? " active" : ""}" role="tab" aria-label="Show faculty slide ${i + 1}" aria-selected="${i === 0 ? "true" : "false"}" onclick="setTeacherSlide(${i})"></button>`
            ).join("");

            // Ensure only the first slide starts active if HTML omitted the class
            slides.forEach((slide, i) => slide.classList.toggle("active", i === 0));
            activeTeacherIndex = 0;
            restartTeacherSlideshow();
        }

