import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Resources.css';

type ResourceType = 'videos' | 'notes' | 'pastPapers';

type SubjectResourceLink = {
  url: string;
  accountUsername: string;
};

type Subject = {
  name: string;
  category: string;
};

const subjectGroups: { category: string; subjects: string[] }[] = [
  {
    category: 'Core subjects',
    subjects: ['Life Orientation', 'Mathematics', 'Mathematical Literacy'],
  },
  {
    category: 'Languages',
    subjects: [
      'Afrikaans Home Language',
      'Afrikaans First Additional Language',
      'English Home Language',
      'English First Additional Language',
      'isiNdebele Home Language',
      'isiNdebele First Additional Language',
      'isiXhosa Home Language',
      'isiXhosa First Additional Language',
      'isiZulu Home Language',
      'isiZulu First Additional Language',
      'Sepedi Home Language',
      'Sepedi First Additional Language',
      'Sesotho Home Language',
      'Sesotho First Additional Language',
      'Setswana Home Language',
      'Setswana First Additional Language',
      'siSwati Home Language',
      'siSwati First Additional Language',
      'Tshivenda Home Language',
      'Tshivenda First Additional Language',
      'Xiitsonga Home Language',
      'Xiitsonga First Additional Language',
    ],
  },
  {
    category: 'Commerce and Management',
    subjects: ['Accounting', 'Business Studies', 'Economics'],
  },
  {
    category: 'Agriculture',
    subjects: ['Agricultural Management Practices', 'Agricultural Sciences', 'Agricultural Technology'],
  },
  {
    category: 'Science and Technology',
    subjects: [
      'Computer Applications Technology',
      'Civil Technology',
      'Electrical Technology',
      'Engineering Graphics and Design',
      'Information Technology',
      'Life Sciences',
      'Mechanical Technology',
      'Physical Sciences',
      'Technical Mathematics',
      'Technical Sciences',
    ],
  },
  {
    category: 'Humanities and Social Sciences',
    subjects: ['Geography', 'History', 'Religion Studies', 'Tourism'],
  },
  {
    category: 'Arts and Culture',
    subjects: ['Dance Studies', 'Design', 'Dramatic Arts', 'Music', 'Visual Arts'],
  },
  {
    category: 'Consumer studies and Hospitality',
    subjects: ['Consumer Studies', 'Hospitality Studies'],
  },
];

const resourceTypes: { id: ResourceType; label: string }[] = [
  { id: 'videos', label: 'Videos' },
  { id: 'notes', label: 'Notes' },
  { id: 'pastPapers', label: 'Past papers' },
];

const subjects: Subject[] = subjectGroups.flatMap(({ category, subjects: names }) =>
  names.map((name) => ({ name, category })),
);

const subjectResourceLinks: Record<string, Partial<Record<ResourceType, SubjectResourceLink[]>>> = {
  'tshivenda-home-language': {
    // Add each video as { url: 'https://...', accountUsername: '@channel' }.
    videos: [ { url: 'https://youtube.com/@luambolwatshivenda?si=z3mShLSJzGQBXg9z', accountUsername: '@Luambo lwa Tshivenda' },
  { url: 'https://youtube.com/@learningtshivenda?si=MqDak7P2jqXsFc-9', accountUsername: '@Learning Tshivenda with Tondani' },
      ],
   notes:[
      { url: 'https://viaafrika.com/wp-content/uploads/2019/07/Tshivenda-Study-Guide-Gr12.pdf', accountUsername: '@Via Afrika'},
      { url: 'https://www.studocu.com/en-za/course/tshivenda-home-language-mandatory/class-notes/4487948/53', accountUsername: '@Studocu'},
    ],
    pastPapers:[
      { url: 'https://www.saexampapers.co.za/grade-12-tshivenda/', accountUsername: '@saexampapers'},
      { url: 'https://www.sapapers.co.za/grade-12/tshivenda-hl', accountUsername: '@sapapers'},
    ],
  },
  'english-home-language': {
    videos: [
      { url: 'https://www.youtube.com/@englishislove', accountUsername: '@English is Love' },
      { url: 'https://www.youtube.com/@EnglishwithMsTLLLechuti1', accountUsername: '@Ms. T.L.L Lechuti English (FAL&HL)lessons' },
    ],
    notes:[
      { url: 'https://effinghamsecondary.co.za/wp-content/uploads/2022/10/English-Intergrated-language-Book1.pdf', accountUsername: '@Effingham Secondary School'},
      { url: 'https://www.scribd.com/document/931944927/English-Home-Language-Grade-12-Notes', accountUsername: '@Scribd'},
    ],
    pastPapers:[
      { url: 'https://www.sapapers.co.za/grade-12-english-hl', accountUsername: '@sapapers'},
      { url: 'https://www.testpapers.co.za/gr-12-english-hl', accountUsername: '@TestPapers'},
    ],
  },
  'afrikaans-home-language': {
    videos: [
      { url: 'https://youtube.com/playlist?list=PLjmbDm1pLQuLBFX9iKaJPV8CMFrBWZ7_j&si=bx1t3pr7CIh0S3iu', accountUsername: '@amore van wyk' },
    { url: 'https://youtube.com/playlist?list=PLJqnChTMSBNLS2qMOriqk7KEgn-rrxs1y&si=Fz-yNdE51AbZKnPy', accountUsername: '@Thuma Mina Teaching' },
    ],
    notes:[
      { url: 'https://mrindividualist.com/wp-content/uploads/2013/07/afrikaans-taal-study-notes.pdf', accountUsername: '@Mr Individualist'},
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/Creative%20Writing%20Home%20Languanges%20FINAL/Afrikaans%20Skryfgids.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr-12-afrikaans-ht', accountUsername: '@TestPapers'},
      { url: 'https://www.sapapers.co.za/grade-12-afrikaans-hl', accountUsername: '@sapapers'},
    ],
  },
  'mathematics': {
    videos: [
      { url: 'https://youtube.com/@kevinmathscience?si=LqnKFeKrUS9MXtL0', accountUsername: '@KevinMathScience' },
      { url: 'https://youtube.com/@mlungisinkosi?si=5QFK5B958EqrZpIz', accountUsername: '@Mlungisi Nkosi Maths & Science' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Mathematics-Trigonometry%20and%20Euclidean%20Geometry%20.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/SelfStudyGuidesGrade10-12.aspx', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.sapapers.co.za/grade-12-mathematics#google_vignette', accountUsername: '@sapapers'},
      { url: 'https://www.testpapers.co.za/gr12-mathematics', accountUsername: '@TestPapers'},
    ],
  },
  'mathematical-literacy': {
    videos: [
      { url: 'https://youtube.com/@maths_monkey?si=kVazyZtLRHcnKKef', accountUsername: '@Maths Monkey' },
      { url: 'https://youtube.com/@kevinmathscience?si=LqnKFeKrUS9MXtL0', accountUsername: '@KevinMathScience' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/LinkClick.aspx?fileticket=jwkFtJReaaw%3d&tabid=728&portalid=0&mid=10046', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Mathematical%20Literacy%20Notes.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.sapapers.co.za/grade-12-mathematical-literacy', accountUsername: '@sapapers'},
      { url: 'https://www.testpapers.co.za/gr-12-mathemtical-literacy', accountUsername: '@TestPapers'},
    ],
  },

  'life-orientation': {
    videos: [
      { url: 'https://youtube.com/playlist?list=PLxbWn1AH92KgwUadGj3fAbYCKQCEx90MD&si=KxGq0QEGupI_f0oH', accountUsername: '@Coeval College' },
      { url: 'https://youtube.com/playlist?list=PLQQGTVE5vO83yVyANGuUfJuiM-YaYMbLY&si=uCGpPjPwe7DcBtHj', accountUsername: '@Ace My Exams' },
    ],
    notes:[
      { url: 'https://www.dropbox.com/s/0x1g6j3k5z8v9q2/Mathematical%20Literacy%20Notes.pdf?dl=0', accountUsername: '@Mathematical Literacy Notes'},
      { url: 'https://www.dropbox.com/s/0x1g6j3k5z8v9q2/Mathematical%20Literacy%20Notes.pdf?dl=0', accountUsername: '@Mathematical Literacy Notes'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr12/life-orientation', accountUsername: '@TestPapers' },
      { url: 'https://www.sapapers.co.za/grade-12-life-orientation', accountUsername: '@sapapers' },
    ],
  },

  'Business Studies': {
    videos: [
      { url: 'https://youtube.com/@nonjabulosa?si=hd1Y3gc5HF-Dnuwj', accountUsername: '@B.Studies with N. Tshabalala' },
   { url: 'https://youtube.com/@teacherilonasmith?si=_8V44DxZSG9V0tIn', accountUsername: '@Teacher Illina Smith' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Business%20Studies%20P1.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Business%20Studies%20P2.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr12-business-studies', accountUsername: '@TestPapers' },
      { url: 'https://www.sapapers.co.za/grade-12-business-studies', accountUsername: '@sapapers' },
    ],
  },
  
  'accounting': {
    videos: [
      { url: 'https://youtube.com/@accountingsolutionsa?si=lnYU_vRSqu6sVfhH', accountUsername: '@Accounting Solution SA' }, 
   { url: 'https://youtube.com/@yourbfftutor?si=euPTT1tAhze9eu0x', accountUsername: '@Luyanda Ralph Gumede' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Cost%20Accounting.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Accounting-INVENTORY%20VALUATION.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr12-accounting', accountUsername: '@TestPapers' },
      { url: 'https://www.sapapers.co.za/grade-12-accounting', accountUsername: '@sapapers' },
    ],
  },

  'economics': {
    videos: [
      { url: 'https://youtube.com/playlist?list=PLTf2BsyTHrntNETKv3DE0DWJ2LUwUTmP4&si=8xdiclp7enq7d_rg', accountUsername: '@HuluLearn' },
    { url: 'https://youtube.com/@economicswithmashudu?si=6g0k1J7j8r3X9W2_', accountUsername: '@Economics with Mashudu' }, 
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Economics%20Business%20Cycles.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Economics%20-Circular%20Flow%20.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr12-economics', accountUsername: '@TestPapers' },
      { url: 'https://www.sapapers.co.za/grade-12-economics', accountUsername: '@sapapers' },
    ],
  },
  
  'life-sciences': {
    videos: [
      { url: 'https://youtube.com/@missangler?si=-N35eswQJxcgAjja', accountUsername: '@Miss Angler' },
      { url: 'https://youtube.com/@lifesciencegeographycaps?si=PBiZXqmqGxzkJ9Sg', accountUsername: '@Life Science and Geography(Caps)' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Life%20Sciences-%20Reproduction%20and%20Endocrine%20System%20and%20Homeostasis.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/LinkClick.aspx?fileticket=WCNQ0-feHKs%3d&tabid=728&portalid=0&mid=10046', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr12-life-sciences', accountUsername: '@TestPapers' },
      { url: 'https://www.sapapers.co.za/grade-12-life-sciences', accountUsername: '@sapapers' },
    ],
  },

  'physical-sciences': {
    videos: [
      { url: 'https://youtube.com/@kevinmathscience?si=LqnKFeKrUS9MXtL0', accountUsername: '@KevinMathScience' },
      { url: 'https://youtube.com/@mlungisinkosi?si=5QFK5B958EqrZpIz', accountUsername: '@Mlungisi Nkosi Maths & Science' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/CD/Computer/Self_Study_Guide_Physics_4mar2011.pdf?ver=2013-11-08-132842-000', accountUsername: '@Mathematical Literacy Notes'},
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/FET/DATA%20DRIVEN%20STUDY%20GUIDES/PHYSICAL%20SCIENCES/PHYSICAL%20SCIENCE_Stoichiometry.pdf?ver=2019-05-16-134324-000', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr12-physical-sciences', accountUsername: '@TestPapers' },
      { url: 'https://www.sapapers.co.za/grade-12-physical-sciences', accountUsername: '@sapapers' },
    ],
  },

  'history': {
    videos: [
      { url: 'https://youtube.com/playlist?list=PLjHpdK12vhKlBbX-KfkNGF4NtB7-o0Nq9&si=3l64_7BN9KT3Qkl_', accountUsername: '@Wlelile FAITH' },
   { url: 'https://youtube.com/playlist?list=PL8j3onXW6Xzuowm7lSSzbUoMSJAoJcfM3&si=rOi3TICOtuYTXib1', accountUsername: '@PHAKAMA RESEARCH' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/HISTORY%20P1.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/HISTORY%20P2.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr12-history', accountUsername: '@TestPapers' },
      { url: 'https://www.sapapers.co.za/grade-12-history', accountUsername: '@sapapers' },
    ],
  },

  'geography': {
    videos: [
      
      { url: 'https://youtube.com/playlist?list=PL2WmZdFbKGJqS8tLo0fNCchNoGHrp-n01&si=2G-dNYIRVQUcZUNN', accountUsername: '@Edu-ca-te' },
      { url: 'https://youtube.com/@closeup_education?si=gmzol9vCiKniChRT', accountUsername: '@CloseUp Education' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Geography-ECONOMIC%20GEOGRAPHY%20REVIEW%20revised.pdf.pdf?ver=2022-01-31-121449-783', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Geography-GEOMORPHOLOGY%20REVIEW%20revised.pdf.pdf?ver=2022-01-31-121525-933', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr12-geography', accountUsername: '@TestPapers' },
      { url: 'https://www.sapapers.co.za/grade-12-geography', accountUsername: '@sapapers' },
    ],
  },

  'computer-applications-technology': {
    videos: [
      { url: 'https://youtube.com/@educationwithmrh?si=ZFrQBM1_BS1NO1vM', accountUsername: '@Education with Mr Hambury' },
    { url: 'https://youtube.com/@mrlongitandcat?si=NH2iVhc6Ymj_c2_N', accountUsername: '@Mr Long Education- IT & CAT' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/CD/Computer/Self-Study_CAT_PAT_2010.pdf?ver=2013-11-08-132736-000', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/Portals/0/CD/Computer/Self-Study_CAT_PAT_2010_Afr.pdf?ver=2013-11-08-132708-000', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr12-computer-applications-technology', accountUsername: '@TestPapers' },
      { url: 'https://www.sapapers.co.za/grade-12-computer-applications-technology', accountUsername: '@sapapers' },
    ],
  },
  'information-technology': {
    videos: [
      { url: 'https://youtube.com/@mrlongitandcat?si=NH2iVhc6Ymj_c2_N', accountUsername: '@Mr Long Education- IT & CAT' },
      { url: 'https://youtube.com/@educationwithmrh?si=ZFrQBM1_BS1NO1vM', accountUsername: '@Education with Mr Hambury' },
    ],
    notes:[
      
     ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr12-information-technology', accountUsername: '@TestPapers' },
      { url: 'https://www.sapapers.co.za/grade-12-information-technology', accountUsername: '@sapapers' },
    ],
  },
  'engineering-graphics-and-design': {
    videos: [
      { url: 'https://youtube.com/@howtoegd?si=wpqmMMxt60hId-g1', accountUsername: '@HowToEGD' },
      { url: 'https://youtube.com/@wimmas?si=lVq3gSq0mEKHZh7e', accountUsername: '@Wimmas EGD' },
    ],
    notes:[
      
     ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr12-engineering-graphics-and-design', accountUsername: '@TestPapers' },
      { url: 'https://www.sapapers.co.za/grade-12-engineering-graphics-and-design', accountUsername: '@sapapers' },
    ],
  },

  'mechanical-technology': {
    videos: [
      { url: 'https://youtube.com/@autoedza2998?si=gE8qZIHgRZHrvUhy', accountUsername: '@Auto ED ZA' },
    ],
    notes:[
       ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr12-mechanical-technology', accountUsername: '@TestPapers' },
      { url: 'https://www.sapapers.co.za/grade-12-mechanical-technology', accountUsername: '@sapapers' },
    ],
  },
  'civil-technology': {
    videos: [
      { url: 'https://youtube.com/playlist?list=PLl8ahShBR4S03zriY5Vp9DEVvs3zXVtUS&si=pA3x_kGvZHbGim-A', accountUsername: '@edurise empowerment hub' },
    ],
    notes:[
    
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr12-civil-technology', accountUsername: '@TestPapers' },
      { url: 'https://www.sapapers.co.za/grade-12-civil-technology', accountUsername: '@sapapers' },
    ],
  },
  'electrical-technology': {
    videos: [
      { url: 'https://youtube.com/playlist?list=PL0BB-n5BdGRjBayrTA2QBp00S2KZnWw2B&si=ljnIW77Zt9-QPU7T', accountUsername: '@Annonymous Stunner Gaming' },
      { url: 'https://youtube.com/playlist?list=PLb9DRPdBiheFKCIutVH0I99kDzH6rJdHb&si=EIJPuJMUQfXiPF3D', accountUsername: '@Clinton de Kock' },
    ],
    notes:[
     
    ],
    pastPapers:[
      { url: 'https://www.sapapers.co.za/grade-12/electrical-technology', accountUsername: '@sapapers'},
      { url: 'https://www.testpapers.co.za/gr-12/electrical-technology', accountUsername: '@TestPapers'},
    ],
  },
  'technical-mathematics': {
    videos: [
      { url: 'https://youtube.com/playlist?list=PL8j3onXW6XzshtJJQ1Iy-gXleIDmhuRTG&si=akHD3uZudX71MnNv', accountUsername: '@PHAKAMA RESEARCH' },
      { url: 'https://youtube.com/playlist?list=PL6jW9mH2Ee4isr_ba36kSold39Owhy2yC&si=j_HreCBRNW3PGTWv', accountUsername: '@Scott Davis Math' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Technical%20Mathematics%20%E2%80%93%20Algebra%20and%20Functions%20and%20Graphs.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Technical%20Mathematics%20%E2%80%93%20Differential%20Calculus%20and%20Integration.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr-12/technical-mathematics', accountUsername: '@TestPapers'},
      { url: 'https://www.sapapers.co.za/grade-12/technical-mathematics', accountUsername: '@sapapers'},
    ],
  },
  'dance-studies': {
    videos: [
      { url: 'https://youtube.com/@dancestudiesonline?si=Iqi0avgBp9iEbUHG', accountUsername: '@Dance Studies Online' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/DANCE%20STUDIES.pdf?ver=2022-09-07-102740-493', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/DESIGN%20STUDIES.pdf?ver=2022-09-07-102740-587', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr-12/dance-studies', accountUsername: '@TestPapers'},
      { url: 'https://www.sapapers.co.za/grade-12/dance-studies', accountUsername: '@sapapers'},
    ],
  },
  'music': {
    videos: [
      { url: 'https://youtube.com/playlist?list=PL5j5H06QkhxE0RK-Ormp3zgf5SGJ28zsj&si=J2X5djmv8g9NvKmW', accountUsername: '@Music Matters' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/MUSIC%20.pdf?ver=2022-09-07-102740-933', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr-12/music', accountUsername: '@TestPapers'},
      { url: 'https://www.sapapers.co.za/grade-12/music', accountUsername: '@sapapers'},
    ],
  },
  'visual-arts': {
    videos: [
      { url: 'https://youtube.com/@mrsmcgillsarthub3465?si=fFBHEKcMW3tJIUMF', accountUsername: '@Mrs McGills Art Hub' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/VISUAL%20ARTS.pdf?ver=2022-09-07-102741-103', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr-12/visual-arts', accountUsername: '@TestPapers'},
      { url: 'https://www.sapapers.co.za/grade-12/visual-arts', accountUsername: '@sapapers'},
    ],
  },
  'religion-studies': {
    videos: [
      { url: 'https://youtube.com/playlist?list=PL-Yf6_ZdxMmRdDyjVvAVoigsvXogDCPoA&si=3qt1wUoiyZeLgbXX', accountUsername: '@Goon School' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/LinkClick.aspx?fileticket=a12rc0QadFg%3d&tabid=728&portalid=0&mid=10046', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/Religion%20In%20Areas%20of%20Conflict.pdf?ver=2022-09-07-102750-923', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr-12/religion-studies', accountUsername: '@TestPapers'},
      { url: 'https://www.sapapers.co.za/grade-12/religion-studies', accountUsername: '@sapapers'},
    ],
  },
  'tourism': {
    videos: [
      { url: 'https://youtube.com/@tourismnmbd?si=bSKSRjEaleM3VOc1', accountUsername: '@Tourism NMBD' },  
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/High%20Enrolment%20Study%20Guides%20FINAL/Tourism%20Communication%20and%20Customer%20Care.pdf?ver=2022-01-21-105004-000', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/Tourism-Domestic%20Regional%20and%20International%20Tourism%20Final.pdf?ver=2022-09-07-102733-157', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr-12/tourism', accountUsername: '@TestPapers'},
      { url: 'https://www.sapapers.co.za/grade-12/tourism', accountUsername: '@sapapers'},
    ],
  },
  'hospitality-studies': {
    videos: [
      { url: 'https://youtube.com/playlist?list=PL1CHWHAvxwM1u91uN7M-It2ur8IlDpurV&si=W4W1ZzNhuflArbtp', accountUsername: '@Mphume Zulu' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/Hospitality%20Studies-Food%20and%20Beverage.pdf?ver=2022-09-07-102732-060', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/Hospitality-%20FOOD%20COMMODITIES%20Final.pdf?ver=2022-09-07-102732-873', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr-12/hospitality-studies', accountUsername: '@TestPapers'},
      { url: 'https://www.sapapers.co.za/grade-12/hospitality-studies', accountUsername: '@sapapers'},
    ],
  },
  'consumer-studies': {
    videos: [
      { url: 'https://youtube.com/playlist?list=PLQQGTVE5vO83fuSDC4rmzdyT7Y06O5dvP&si=Z5vAg2Z-mFmn8Alu', accountUsername: '@Ace My Exams' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/Consumer%20Studies-ENTREPRENEURSHIP%20Final.pdf?ver=2022-09-07-102732-013', accountUsername: '@Education Department'},
      { url: 'https://www.education.gov.za/LinkClick.aspx?fileticket=tmggMXkycAc%3d&tabid=728&portalid=0&mid=10046', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr-12/consumer-studies', accountUsername: '@TestPapers'},
      { url: 'https://www.sapapers.co.za/grade-12/consumer-studies', accountUsername: '@sapapers'},
    ],
  },
  'design': {
    videos: [
      { url: 'https://youtube.com/@howtodesign?si=0g1k3r6J7j8X9W2_', accountUsername: '@HowToDesign' },
    ],
    notes:[
      { url: 'https://www.education.gov.za/Portals/0/Documents/Manuals/2022%20Study%20Guides/DESIGN%20STUDIES.pdf?ver=2022-09-07-102740-587', accountUsername: '@Education Department'},
    ],
    pastPapers:[
      { url: 'https://www.testpapers.co.za/gr-12/design', accountUsername: '@TestPapers'},
      { url: 'https://www.sapapers.co.za/grade-12/design', accountUsername: '@sapapers'},
    ],
  },
};

function getSubjectSlug(name: string) {
  return name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function SubjectIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 6.5C9.5 4.7 6.3 4.5 3 5.5v14c3.3-1 6.5-.8 9 1 2.5-1.8 5.7-2 9-1v-14c-3.3-1-6.5-.8-9 1Z" />
      <path d="M12 6.5v14" />
    </svg>
  );
}

function SubjectCard({ subject, number }: { subject: Subject; number: number }) {
  return (
    <Link
      className="resource-card subject-card-link"
      to={`/resources/${getSubjectSlug(subject.name)}`}
      aria-label={`Open ${subject.name} resources`}
    >
      <div className="resource-card-top">
        <span className="resource-icon">
          <SubjectIcon />
        </span>
        <span className="resource-number">{String(number).padStart(2, '0')}</span>
      </div>

      <p className="resource-category">{subject.category}</p>
      <h3>{subject.name}</h3>
      <p className="resource-description">Study support for Grades 10–12.</p>
      <span className="subject-card-action">
        View subject resources <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const filteredSubjects = subjects.filter((subject) =>
    `${subject.name} ${subject.category}`.toLocaleLowerCase().includes(normalizedSearch),
  );
  let subjectNumber = 0;

  return (
    <section className="page resources-page" aria-labelledby="resources-title">
      <section className="resources-hero">
        <div className="resources-hero-copy">
          <p className="resources-kicker">Your next step starts here</p>
          <h1 id="resources-title">Study smarter, your way.</h1>
          <p className="resources-intro">
            Find your Grade 10–12 subjects, then choose the study support you need. YouTube
            channels, Notes and Past Papers.
          </p>
        </div>
      </section>

      <section className="resources-section" aria-labelledby="subjects-title">
        <div className="resources-header">
          <div>
            <p className="resources-section-label">A place to start</p>
            <h2 id="subjects-title">Study resources by subject</h2>
          </div>
          <p>Browse subjects or search by name to find your study resources.</p>
        </div>

        <label className="subject-search">
          <span>Find a subject</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search subjects"
          />
        </label>

        <p className="subject-count" aria-live="polite">
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </p>

        <div className="subject-groups">
          {subjectGroups.map(({ category }) => {
            const groupSubjects = filteredSubjects.filter((subject) => subject.category === category);
            if (groupSubjects.length === 0) return null;
            const groupId = category.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-');

            return (
              <section className="subject-group" key={category} aria-labelledby={`group-${groupId}`}>
                <h3 id={`group-${groupId}`}>{category}</h3>
                <div className="resources-grid">
                  {groupSubjects.map((subject) => {
                    subjectNumber += 1;
                    return (
                      <SubjectCard
                        key={subject.name}
                        subject={subject}
                        number={subjectNumber}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {filteredSubjects.length === 0 && (
          <p className="subject-empty">No subjects match “{searchTerm}”. Try another search.</p>
        )}

        <p className="resources-note">
          Subject availability can vary by school and curriculum. Confirm your subject offering
          with your school.
        </p>
      </section>
    </section>
  );
}

export function SubjectResources() {
  const { subjectSlug } = useParams();
  const subject = subjects.find((item) => getSubjectSlug(item.name) === subjectSlug);

  if (!subject) {
    return (
      <section className="page resources-page">
        <div className="subject-detail-empty">
          <h1>Subject not found</h1>
          <p>That subject isn’t in the directory.</p>
          <Link to="/resources">Back to all subjects</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page resources-page" aria-labelledby="subject-title">
      <Link className="subject-back-link" to="/resources">
        <span aria-hidden="true">←</span> All subjects
      </Link>

      <section className="resources-hero">
        <div className="resources-hero-copy">
          <p className="resources-kicker">{subject.category}</p>
          <h1 id="subject-title">{subject.name}</h1>
          <p className="resources-intro">
            Find videos, notes and past papers to support your {subject.name} studies.
          </p>
        </div>
      </section>

      <section className="resources-section" aria-labelledby="subject-resources-title">
        <div className="resources-header">
          <div>
            <p className="resources-section-label">Study support</p>
            <h2 id="subject-resources-title">{subject.name} resources</h2>
          </div>
          <p>Choose a resource type to find the support you need.</p>
        </div>

        <div className="subject-detail-grid">
          {resourceTypes.map(({ id, label }) => {
            const links = subjectResourceLinks[getSubjectSlug(subject.name)]?.[id] ?? [];

            return (
              <article className="subject-detail-card" key={id}>
                <span className="subject-detail-icon">
                  <SubjectIcon />
                </span>
                <h3>{label}</h3>
                {links.length > 0 ? (
                  <ul className="subject-resource-links">
                    {links.map(({ url, accountUsername }) => (
                      <li key={url}>
                        <span>{accountUsername}</span>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          Open {label.toLocaleLowerCase()} <span aria-hidden="true">↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Resources for this subject will be added here.</p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
