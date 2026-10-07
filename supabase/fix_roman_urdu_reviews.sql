-- One-time fix: replace the Roman Urdu sample reviews that were already
-- inserted in the live database with proper English text.
-- Run in Supabase SQL Editor. Safe to run more than once.

update public.reviews
   set review_text = 'After completing the AI Engineering course at TSI, I started getting online freelancing gigs. I had never found this quality of learning in Barikot before!'
 where student_name = 'Asad Ali'
   and review_text like 'TSI se AI Engineering%';

update public.reviews
   set review_text = 'I took my NEBOSH IGC coaching here and cleared the exam easily. The management and teachers are very professional.'
 where student_name = 'Adnan Khan'
   and review_text like 'Maine yahan se NEBOSH%';

update public.reviews
   set review_text = 'For FSc Physics coaching, Engr. Abid Rasheed is unmatched. Every concept becomes crystal clear.'
 where student_name = 'Sana Ullah'
   and review_text like 'FSc Physics ki coaching%';
