// Injects Schema.org Course + AggregateRating + Review JSON-LD for every course
// that has student reviews, so Google can show star-rating rich snippets.
(function () {
    function buildCourseSchema() {
        if (typeof COURSE_CATALOG_DATA === 'undefined') return;

        const SITE = 'https://spectruminstitute.uk';
        const courses = Object.keys(COURSE_CATALOG_DATA)
            .filter(name => COURSE_CATALOG_DATA[name].studentReviews && COURSE_CATALOG_DATA[name].studentReviews.length)
            .map(name => {
                const c = COURSE_CATALOG_DATA[name];
                const reviews = c.studentReviews.map(r => ({
                    "@type": "Review",
                    "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": r.rating || 5,
                        "bestRating": 5
                    },
                    "author": { "@type": "Person", "name": r.name },
                    "reviewBody": r.text
                }));

                return {
                    "@context": "https://schema.org",
                    "@type": "Course",
                    "name": name,
                    "description": `${name} course at The Spectrum Institute (TSI), Barikot & Mingora, Swat.`,
                    "provider": {
                        "@type": "EducationalOrganization",
                        "name": "The Spectrum Institute",
                        "sameAs": SITE
                    },
                    "hasCourseInstance": {
                        "@type": "CourseInstance",
                        "courseMode": "In-person",
                        "instructor": {
                            "@type": "Person",
                            "name": c.instructor && c.instructor.name,
                            "jobTitle": c.instructor && c.instructor.title
                        }
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": c.rating,
                        "reviewCount": c.reviews,
                        "bestRating": 5
                    },
                    "review": reviews
                };
            });

        if (!courses.length) return;

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'course-schema-jsonld';
        script.textContent = JSON.stringify(courses.length === 1 ? courses[0] : courses);
        document.head.appendChild(script);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildCourseSchema);
    } else {
        buildCourseSchema();
    }
})();
