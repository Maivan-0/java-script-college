class AskedStudents {
    constructor(data) {
        this.groups = data.groups;

        this.groupSelect = document.querySelector("[data-js-group-select]");

        this.studentsListContainer = document.querySelector('[data-js-students-list]');
        this.btnRandom = document.querySelector('[data-js-btn-random-student]');
        this.btnReset = document.querySelector('[data-js-btn-reset-student-list]');
        this.btnSetGrade = document.querySelector('[data-js-btn-set-grade]');

        this.students = [];

        this.askedFirstName = document.querySelector('[data-js-asked-first-name]');
        this.askedLastName = document.querySelector('[data-js-asked-last-name]');
        this.inputGradeTop = document.querySelector('[data-js-input-grade-top]');

        this.selectedStudentId = null;

        this.loadSave();

        this.selectGroup();
        this.selectRandomStudent();
        this.setSelectedStudentGrade();
        this.resetStudentsList();
        this.setAbsenceGrade();
    }

    loadSave() {
        const saveStudents = localStorage.getItem('students');

        if (saveStudents) {
            this.students = JSON.parse(saveStudents);
            this.displayStudents();
        }
    }

    selectGroup() {
        this.groupSelect.addEventListener('change', () => {
            if(confirm('Are you sure?'))
                this.getStudentsList();
        })

        this.resetAskedForm();
    }

    getStudentsList() {
        const groupName = this.groupSelect.value;

        const groupFound = this.groups.find(group => group.id === groupName);

        if(groupFound) {
            this.students = [ ...groupFound.students ];
            this.displayStudents();
        }

        /*
            if (groupName) {
                fetch(`http://localhost:3000/groups/${groupName}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data) {
                            this.students = data.students;
                            this.displayStudents();

                            localStorage.setItem('students', JSON.stringify(this.students));
                        }
                    })
            }
         */
    }



    displayStudents() {
        this.studentsListContainer.innerHTML = '';

        this.students.forEach((student, index) => {
            const div = document.createElement('div');
            div.classList.add('students-list__row');
            div.id = student.id;
            div.innerHTML = `
                <span class="students-list__cell">${index + 1}</span>
                <span class="students-list__cell">${student.firstName}</span>
                <span class="students-list__cell">${student.lastName}</span>
                <div class="students-list__cell center">
                    <input type="checkbox" class="students-list__checkbox" ${student.status.absent ? "checked" : ""} aria-label="Absence">
                </div>
                <div class="students-list__cell center">
                    <input type="number" class="students-list__input" value="${student.status.grade || ""}" ${student.status.absent ? "disabled" : ""} maxlength="2" placeholder="-" aria-label="Grade">
                </div>
                <div class="students-list__cell center">
                    <span class="students-list__status ${student.status.absent ? "absent" : student.status.asked ? "asked" : "waiting"}"></span>
                </div>
            `;

            this.studentsListContainer.appendChild(div);
        })

        localStorage.setItem('students', JSON.stringify(this.students));
    }

    selectRandomStudent() {
        this.btnRandom.addEventListener('click', (event) => {
            event.preventDefault();

            const eligible = this.students.filter(student => !student.status.absent && !student.status.asked);

            if (eligible.length === 0) {
                alert('Don`t have students to ask!');
                return;
            }

            const randomStudent = eligible[Math.floor(Math.random() * eligible.length)];
            this.selectedStudentId = randomStudent.id;

            this.askedFirstName.textContent = randomStudent.firstName;
            this.askedLastName.textContent = randomStudent.lastName;
            this.inputGradeTop.value = randomStudent.status.grade || "";
            this.inputGradeTop.focus();
        })
    }

    setSelectedStudentGrade() {
        this.btnSetGrade.addEventListener('click', (event) => {
            event.preventDefault();

            if (this.selectedStudentId === null || this.inputGradeTop.value === "") {
                return;
            }

            if (parseInt(this.inputGradeTop.value) <= 0) this.inputGradeTop.value = "1";
            if (parseInt(this.inputGradeTop.value) > 10) this.inputGradeTop.value = "10";

            const student = this.students.find(student => student.id === this.selectedStudentId);

            if (student) {
                student.status.grade = this.inputGradeTop.value;
                student.status.asked = true;
            }

            const parentElement = this.studentsListContainer.querySelector(`#${this.selectedStudentId}`);

            this.updateStatusVisual(parentElement, student);

            this.resetAskedForm();
        })
    }

    resetStudentsList() {
        this.btnReset.addEventListener('click', (event) => {
            event.preventDefault();

            this.students.forEach(student => {
                student.status.asked = false;
            })

            this.resetAskedForm();

            this.displayStudents();
        })
    }

    resetAskedForm() {
        this.askedFirstName.textContent = '';
        this.askedLastName.textContent = '';
        this.inputGradeTop.value = '';
        this.inputGradeTop.blur();

        this.selectedStudentId = null;
    }

    setAbsenceGrade() {
        this.studentsListContainer.addEventListener('input', (event) => {
            const {target} = event;
            const parentElement = target.closest('.students-list__row');

            if (!parentElement) return;

            const student = this.students.find(student => student.id === parentElement.id);

            if (student) {
                if (target.type === "checkbox") {
                    student.status.absent = target.checked;

                    if (target.checked) {
                        student.status.grade = "";
                        student.status.asked = false;
                    }
                }
                if (target.type === "number") {
                    if (parseInt(target.value) <= 0) target.value = "1";
                    if (parseInt(target.value) > 10) target.value = "10";

                    student.status.grade = target.value;
                }

                localStorage.setItem('students', JSON.stringify(this.students));

                this.updateStatusVisual(parentElement, student);
            }
        });
    }

    updateStatusVisual(rowElement, student) {
        const statusCircle = rowElement.querySelector('.students-list__status');
        const gradeInput = rowElement.querySelector('.students-list__input');

        if (!statusCircle || !gradeInput) return;

        statusCircle.classList.remove("absent", "waiting", "asked");

        if (student.status.absent)
            statusCircle.classList.add("absent");
        else if (student.status.asked)
            statusCircle.classList.add("asked");
        else
            statusCircle.classList.add("waiting");

        gradeInput.disabled = student.status.absent;
        gradeInput.value = student.status.absent ? "" : student.status.grade;

        localStorage.setItem('students', JSON.stringify(this.students));
    }
}

const groups = {
    "groups": [
        {
            "id": "W-2511",
            "students": [
                { "id": "W2511-01", "lastName": "Alexuța", "firstName": "Octavian", "patronymic": "Anatolii", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-02", "lastName": "Bereghici", "firstName": "Marius", "patronymic": "Sorin", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-03", "lastName": "Bobeica", "firstName": "Tatiana", "patronymic": "Nicolai", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-04", "lastName": "Bragari", "firstName": "Sorin", "patronymic": "Andrei", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-05", "lastName": "Brudari", "firstName": "Valentina", "patronymic": "Gheorghe", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-06", "lastName": "Bulgac", "firstName": "Gheorghe", "patronymic": "Grigore", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-07", "lastName": "Castraveț", "firstName": "Evelina", "patronymic": "Serghei", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-08", "lastName": "Cîrlan", "firstName": "Ion", "patronymic": "Constantin", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-09", "lastName": "Demian", "firstName": "Alexei", "patronymic": "Alexei", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-10", "lastName": "Domenco", "firstName": "Corneliu", "patronymic": "Valeriu", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-11", "lastName": "Donțu", "firstName": "Dumitru", "patronymic": "Veaceslav", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-12", "lastName": "Durleșteanu", "firstName": "Adelia", "patronymic": "Eduard", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-13", "lastName": "Gajiu", "firstName": "Vladislav", "patronymic": "Oleg", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-14", "lastName": "Gore", "firstName": "Vitalie", "patronymic": "Igor", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-15", "lastName": "Gultur", "firstName": "Vasile", "patronymic": "Vadim", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-16", "lastName": "Iovv", "firstName": "Vladislava", "patronymic": "Iulian", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-17", "lastName": "Jecova", "firstName": "Sarra", "patronymic": "Alexandru", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-18", "lastName": "Lupașco", "firstName": "Ionuț", "patronymic": "Sergiu", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-19", "lastName": "Mașcauțan", "firstName": "Ion", "patronymic": "Mihail", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-20", "lastName": "Obadă", "firstName": "Mihai", "patronymic": "Ion", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-21", "lastName": "Olednic", "firstName": "Iulian", "patronymic": "Victor", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-22", "lastName": "Pînzaru", "firstName": "Timur", "patronymic": null, "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-23", "lastName": "Popovschii", "firstName": "Cătălin", "patronymic": "Ruslan", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-24", "lastName": "Railean", "firstName": "Gabriela", "patronymic": "Vitalie", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-25", "lastName": "Rusu", "firstName": "Iulian", "patronymic": "Oleg", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-26", "lastName": "Saulea", "firstName": "Marius", "patronymic": "Anatolie", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-27", "lastName": "Savițchi", "firstName": "Sebastian", "patronymic": "Maxim", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-28", "lastName": "Staci", "firstName": "Laura", "patronymic": "Pavel", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-29", "lastName": "Teibaș", "firstName": "Valeria", "patronymic": "Eugeniu", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-30", "lastName": "Țărna", "firstName": "Mihail", "patronymic": "Mihail", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-31", "lastName": "Țeruș", "firstName": "Cristina", "patronymic": "Tudor", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-32", "lastName": "Vodă", "firstName": "Alexandru", "patronymic": "Oleg", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-33", "lastName": "Vudvud", "firstName": "Victor", "patronymic": "Vitalie", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2511-34", "lastName": "Zaițev", "firstName": "Veaceslav", "patronymic": "Veaceslav", "status": { "absent": false, "grade": null, "asked": false } }
            ]
        },
        {
            "id": "W-2512",
            "students": [
                { "id": "W2512-01", "lastName": "Bogdan", "firstName": "Bogdan", "patronymic": "Nicolae", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-02", "lastName": "Borodin", "firstName": "Lucian", "patronymic": "Victor", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-03", "lastName": "Buciușcanu", "firstName": "Ilie", "patronymic": "Eduard", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-04", "lastName": "Chiforișin", "firstName": "Daniel", "patronymic": "Andrei", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-05", "lastName": "Ciubotaru", "firstName": "Dan", "patronymic": "Petru", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-06", "lastName": "Cojocari", "firstName": "Marin", "patronymic": "Viorel", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-07", "lastName": "Corsan", "firstName": "Teodor", "patronymic": "Iurie", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-08", "lastName": "Dogaru", "firstName": "Damian", "patronymic": "Alexei", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-09", "lastName": "Garaba", "firstName": "Mihaela", "patronymic": "Radu", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-10", "lastName": "Gherjavca", "firstName": "Octavian", "patronymic": "Eduard", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-11", "lastName": "Gherman", "firstName": "Mădălin", "patronymic": "Adrian", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-12", "lastName": "Grapin", "firstName": "Ilie", "patronymic": null, "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-13", "lastName": "Lazar", "firstName": "Răzvan", "patronymic": "Igor", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-14", "lastName": "Lepădatu", "firstName": "Denis", "patronymic": null, "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-15", "lastName": "Lupașco", "firstName": "Lucian", "patronymic": "Victor", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-16", "lastName": "Magurean", "firstName": "Nicolae", "patronymic": "Simion", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-17", "lastName": "Mucinschi", "firstName": "Sorin", "patronymic": "Vasile", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-18", "lastName": "Muntean", "firstName": "Anastasia", "patronymic": "Artur", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-19", "lastName": "Ohoțchii", "firstName": "Ana-Maria", "patronymic": "Ion", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-20", "lastName": "Pavlovschi", "firstName": "Gleb", "patronymic": "Ilie", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-21", "lastName": "Pînzari", "firstName": "Lucian", "patronymic": "Vasile", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-22", "lastName": "Popov", "firstName": "Giulia", "patronymic": "Oleg", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-23", "lastName": "Postoronca", "firstName": "Pavlina", "patronymic": "Pavel", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-24", "lastName": "Prisacari", "firstName": "Tatiana", "patronymic": "Oleg", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-25", "lastName": "Rotari", "firstName": "Dumitru", "patronymic": "Andrei", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-26", "lastName": "Sandu", "firstName": "Mădălina", "patronymic": "Gheorghe", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-27", "lastName": "Sîngeapă", "firstName": "Augustin", "patronymic": "Viorel", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-28", "lastName": "Tarlev", "firstName": "Mihai", "patronymic": "Mihail", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-29", "lastName": "Tcaci", "firstName": "Nicoleta", "patronymic": "Alexandru", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-30", "lastName": "Tesevici", "firstName": "Sevastian", "patronymic": "Igor", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-31", "lastName": "Velișco", "firstName": "Nelea", "patronymic": "Timofei", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-32", "lastName": "Vicol", "firstName": "Sergiu", "patronymic": "Ion", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-33", "lastName": "Voluță", "firstName": "Marius", "patronymic": "Nicolae", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2512-34", "lastName": "Vrănescu", "firstName": "David", "patronymic": "Eugeniu", "status": { "absent": false, "grade": null, "asked": false } }
            ]
        },
        {
            "id": "W-2331",
            "students": [
                { "id": "W2331-01", "lastName": "Antonii", "firstName": "Nadejda", "patronymic": null, "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-02", "lastName": "Baciu", "firstName": "Valeria", "patronymic": "Alexandru", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-03", "lastName": "Bencheci", "firstName": "Nichita", "patronymic": "Marin", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-04", "lastName": "Boțan", "firstName": "Maxim", "patronymic": "Tudor", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-05", "lastName": "Bulbaș", "firstName": "Andreea", "patronymic": "Andrei", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-06", "lastName": "Bulmaga", "firstName": "Albert", "patronymic": "Iurie", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-07", "lastName": "Caproș", "firstName": "Carolina", "patronymic": "Alexandru", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-08", "lastName": "Călugăru", "firstName": "Călin", "patronymic": "Gheorghe", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-09", "lastName": "Ceban", "firstName": "Natalia", "patronymic": "Serghei", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-10", "lastName": "Ceban", "firstName": "Dorin", "patronymic": "Eugeniu", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-11", "lastName": "Ciburciu", "firstName": "Sebastian", "patronymic": "Mihail", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-12", "lastName": "Costandoi", "firstName": "Veniamin", "patronymic": "Viorel", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-13", "lastName": "Danu", "firstName": "Teodor", "patronymic": "Victor", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-14", "lastName": "Dimov", "firstName": "Mihai", "patronymic": "Sergiu", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-15", "lastName": "Gobjila", "firstName": "Melania", "patronymic": "Serghei", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-16", "lastName": "Gorbatiuc", "firstName": "Vladislav", "patronymic": "Eduard", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-17", "lastName": "Guțu", "firstName": "Cristian", "patronymic": "Igor", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-18", "lastName": "Iacovlev", "firstName": "Elizaveta", "patronymic": "Victor", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-19", "lastName": "Kolin", "firstName": "Andrei", "patronymic": "Piotr", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-20", "lastName": "Lebediuc", "firstName": "Maria", "patronymic": "Boris", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-21", "lastName": "Melnic", "firstName": "Marin", "patronymic": "Anatolie", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-22", "lastName": "Morozova", "firstName": "Daria", "patronymic": "Daniil", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-23", "lastName": "Năstase", "firstName": "Maria-Carina", "patronymic": "Adrian", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-24", "lastName": "Neculce", "firstName": "Loredana", "patronymic": "Valentin", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-25", "lastName": "Paierele", "firstName": "Ion", "patronymic": "Alexandru", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-26", "lastName": "Popa", "firstName": "Eugen", "patronymic": "Serghei", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-27", "lastName": "Procopii", "firstName": "Iulian", "patronymic": "Eduard", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-28", "lastName": "Roşca", "firstName": "Dionis", "patronymic": "Vitalie", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-29", "lastName": "Rotaru", "firstName": "Mihai", "patronymic": "Sergiu", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-30", "lastName": "Sanduţa", "firstName": "Sandu", "patronymic": "Tudor", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-31", "lastName": "Savan", "firstName": "Vlad", "patronymic": "Nicolai", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-32", "lastName": "Stepanciuc", "firstName": "Ionela", "patronymic": "Vladimir", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-33", "lastName": "Șcerbataia", "firstName": "Nicoleta", "patronymic": "Vasile", "status": { "absent": false, "grade": null, "asked": false } },
                { "id": "W2331-34", "lastName": "Zaharadji", "firstName": "Vlada", "patronymic": "Veaceslav", "status": { "absent": false, "grade": null, "asked": false } }
            ]
        }
    ]
}

new AskedStudents(groups);