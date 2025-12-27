// ============================================
// PRESET QUESTIONS - Gotowe pytania dla projektanta
// ============================================

export const PRESET_QUESTIONS = {
    lighting: {
        category: "Oswietlenie",
        questions: [
            {
                question: "Jakie rodzaje oswietlenia preferujesz?",
                type: "MULTIPLE_CHOICE" as const,
                options: [
                    "Naturalne maksymalnie wykorzystane",
                    "Oswietlenie sufitowe glowne",
                    "Oswietlenie punktowe / spoty",
                    "Oswietlenie dekoracyjne (tasmy LED, kinkiety, lampy designerskie)"
                ]
            },
            {
                question: "Czy chcesz system inteligentnego sterowania oswietleniem?",
                type: "SINGLE_CHOICE" as const,
                options: [
                    "Tak, pelna automatyka (sterowanie z aplikacji, sciemniacze)",
                    "Czesciowo (tylko sciemniacze)",
                    "Nie, tradycyjne wlaczniki"
                ]
            }
        ]
    },
    bathroom: {
        category: "Lazienka",
        questions: [
            {
                question: "Wanna, prysznic czy oba rozwiazania?",
                type: "SINGLE_CHOICE" as const,
                options: ["Tylko wanna", "Tylko prysznic", "Wanna i prysznic"]
            },
            {
                question: "Prysznic: otwarty typu walk-in czy zamkniety?",
                type: "SINGLE_CHOICE" as const,
                options: ["Walk-in (otwarty)", "Zamkniety (kabina)", "Nie dotyczy"]
            },
            {
                question: "Liczba umywalek?",
                type: "SINGLE_CHOICE" as const,
                options: ["1 umywalka", "2 umywalki (podwojna)", "Wiecej"]
            },
            {
                question: "Czy wazne sa dodatkowe funkcje?",
                type: "MULTIPLE_CHOICE" as const,
                options: [
                    "Bidet",
                    "Pralka/suszarka w zabudowie",
                    "Ogrzewanie podlogowe",
                    "Lustro podswietlane",
                    "Zadne z powyzszych"
                ]
            }
        ]
    },
    kitchen: {
        category: "Kuchnia",
        questions: [
            {
                question: "Uklad kuchni: otwarta na salon czy zamknieta?",
                type: "SINGLE_CHOICE" as const,
                options: ["Otwarta na salon", "Zamknieta (osobne pomieszczenie)", "Polotowarta"]
            },
            {
                question: "Jaki styl kuchni preferujesz?",
                type: "SINGLE_CHOICE" as const,
                options: ["Minimalistyczna", "Klasyczna", "Designerska/nowoczesna", "Rustykalna", "Industrialna"]
            },
            {
                question: "Wyspa / polwysep kuchenny?",
                type: "SINGLE_CHOICE" as const,
                options: ["Tak, wyspa", "Tak, polwysep", "Nie"]
            },
            {
                question: "Sprzety AGD: wolnostojace czy w zabudowie?",
                type: "SINGLE_CHOICE" as const,
                options: ["Wszystko w zabudowie", "Wolnostojace", "Mix"]
            },
            {
                question: "Czy chcesz wydzielona spizarnie / miejsce do przechowywania?",
                type: "SINGLE_CHOICE" as const,
                options: ["Tak, duza spizarnia", "Tak, mala spizarnia", "Nie, wystarczy standardowa zabudowa"]
            }
        ]
    },
    livingRoom: {
        category: "Salon",
        questions: [
            {
                question: "Czy ma byc miejsce na duzy stol jadalniany?",
                type: "SINGLE_CHOICE" as const,
                options: ["Tak, dla 6+ osob", "Tak, dla 4 osob", "Nie, jemy w kuchni"]
            },
            {
                question: "Czy potrzebne jest miejsce na kino domowe / rzutnik?",
                type: "SINGLE_CHOICE" as const,
                options: ["Tak, z rzutnikiem", "Tak, duzy TV", "Nie"]
            },
            {
                question: "Jakie meble sa dla Ciebie priorytetowe?",
                type: "MULTIPLE_CHOICE" as const,
                options: [
                    "Duza wygodna sofa",
                    "Fotele",
                    "Biblioteczka / regal na ksiazki",
                    "Barek / minibar",
                    "Biurko / miejsce do pracy"
                ]
            }
        ]
    },
    bedroom: {
        category: "Sypialnia",
        questions: [
            {
                question: "Rozmiar lozka?",
                type: "SINGLE_CHOICE" as const,
                options: ["160x200 cm", "180x200 cm", "200x200 cm (king size)"]
            },
            {
                question: "Czy potrzebna garderoba / walk-in closet?",
                type: "SINGLE_CHOICE" as const,
                options: ["Tak, osobne pomieszczenie", "Tak, w sypialni", "Nie, wystarczy szafa"]
            },
            {
                question: "Czy sypialnia ma miec TV?",
                type: "SINGLE_CHOICE" as const,
                options: ["Tak", "Nie"]
            }
        ]
    },
    general: {
        category: "Ogolne",
        questions: [
            {
                question: "Jaki styl wnetrz Ci sie podoba?",
                type: "MULTIPLE_CHOICE" as const,
                options: [
                    "Minimalistyczny",
                    "Skandynawski",
                    "Nowoczesny",
                    "Klasyczny",
                    "Industrialny",
                    "Boho",
                    "Japandi"
                ]
            },
            {
                question: "Jakie kolory preferujesz?",
                type: "MULTIPLE_CHOICE" as const,
                options: [
                    "Jasne, neutralne (bialy, bez, szary)",
                    "Ciemne (czern, grafit, granat)",
                    "Ciepte (brazowy, terakota, zloto)",
                    "Pastelowe",
                    "Wyraziste akcenty kolorystyczne"
                ]
            },
            {
                question: "Czy masz zwierzeta domowe?",
                type: "SINGLE_CHOICE" as const,
                options: ["Tak, pies", "Tak, kot", "Tak, inne", "Nie"]
            },
            {
                question: "Czy masz dzieci? Jesli tak, w jakim wieku?",
                type: "TEXT" as const,
                options: []
            }
        ]
    }
}
