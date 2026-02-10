// Hypertension Survey Questionnaires - Complete Data
// This file contains all questionnaire definitions in JSON format wrapped in JavaScript

const QUESTIONNAIRES = {
    patients: {
        id: 'patients',
        icon: 'bi-person',
        title: 'Patient Questionnaire',
        idPrefix: 'PAT',
        sections: [
            {
                id: 'meta',
                title: 'Basic Information',
                questions: [
                    { 
                        id: 'studySite', 
                        label: 'Study Site', 
                        type: 'select', 
                        required: true,
                        options: ['Tetteh Quarshie Memorial Hospital', 'Atibie Government Hospital', 'Atua Government Hospital', 'Oda Government Hospital', 'Suhum Government Hospital', 'ERHD', 'Center for Plant Medicine Research', 'Other']
                    },
                    {
                        id: 'studySiteOther',
                        label: 'Please specify study site',
                        type: 'text',
                        showIf: { field: 'studySite', value: 'Other' },
                        required: true
                    },
                    { id: 'date', label: 'Date', type: 'date', required: true },
                    { id: 'interviewer', label: 'Interviewer Initials', type: 'text', maxlength: 5, required: true }
                ]
            },
            {
                id: 'sectionA',
                title: 'SECTION A: DEMOGRAPHIC INFORMATION',
                questions: [
                    {
                        id: 'age',
                        label: 'A1. Age Range',
                        type: 'select',
                        required: true,
                        options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
                    },
                    {
                        id: 'gender',
                        label: 'A2. Gender',
                        type: 'radio',
                        required: true,
                        options: ['Male', 'Female', 'Prefer not to say']
                    },
                    {
                        id: 'education',
                        label: 'A3. Highest level of education completed',
                        type: 'select',
                        required: true,
                        options: ['No formal education', 'Primary school', 'Junior High School (JHS)', 'Senior High School (SHS)', 'Tertiary/University', 'Other']
                    },
                    {
                        id: 'employment',
                        label: 'A4. Current employment status',
                        type: 'select',
                        required: true,
                        options: ['Employed full-time', 'Employed part-time', 'Self-employed', 'Unemployed', 'Retired', 'Student']
                    },
                    {
                        id: 'maritalStatus',
                        label: 'A5. Marital status',
                        type: 'select',
                        required: true,
                        options: ['Single', 'Married', 'Divorced/Separated', 'Widowed']
                    }
                ]
            },
            {
                id: 'sectionB',
                title: 'SECTION B: HYPERTENSION DIAGNOSIS & TREATMENT HISTORY',
                questions: [
                    {
                        id: 'diagnosisDuration',
                        label: 'B1. How long ago were you diagnosed with hypertension?',
                        type: 'select',
                        required: true,
                        options: ['Less than 6 months', '6 months - 1 year', '1-3 years', '3-5 years', 'More than 5 years']
                    },
                    {
                        id: 'treatmentLocation',
                        label: 'B2. Where do you usually receive treatment? (Select all that apply)',
                        type: 'checkbox',
                        options: ['Government hospital/clinic', 'Private hospital/clinic', 'Community health center (CHPS)', 'Pharmacy', 'Herbal practitioner', 'Faith healer/spiritual center', 'Self-medication at home', 'Other']
                    },
                    {
                        id: 'takingMedication',
                        label: 'B3. Are you currently taking prescribed medication for hypertension?',
                        type: 'select',
                        required: true,
                        options: ['Yes', 'No']
                    },
                    {
                        id: 'medicationAdherence',
                        label: 'B4. In the past month, how often did you take your prescribed medication as directed?',
                        type: 'select',
                        showIf: { field: 'takingMedication', value: 'Yes' },
                        options: ['Every day (100%)', 'Most days (75-99%)', 'Sometimes (50-74%)', 'Rarely (25-49%)', 'Never (0-24%)']
                    },
                    {
                        id: 'missReasons',
                        label: 'B5. What are the main reasons you sometimes miss taking your medication? (Select all)',
                        type: 'checkbox',
                        showIf: { field: 'takingMedication', value: 'Yes' },
                        options: ['Forget to take it', 'Cost too high', 'Medication finished/not available', 'Side effects', 'Feeling better/no symptoms', 'Distance to health facility', 'Using herbal remedies instead', 'Other']
                    },
                    {
                        id: 'usingHerbs',
                        label: 'B6. Do you currently use any herbal or traditional remedies for your blood pressure?',
                        type: 'select',
                        required: true,
                        options: ['Yes', 'No']
                    },
                    {
                        id: 'herbalRemedies',
                        label: 'B7. Which herbal remedies do you use? (Select all)',
                        type: 'checkbox',
                        showIf: { field: 'usingHerbs', value: 'Yes' },
                        options: ['Garlic', 'Ginger', 'Neem leaves', 'Moringa', 'Bitter leaf', 'African star apple (Alasa)', 'Mixture from herbalist', 'Other']
                    },
                    {
                        id: 'herbalFrequency',
                        label: 'B8. How often do you use these herbal remedies?',
                        type: 'select',
                        showIf: { field: 'usingHerbs', value: 'Yes' },
                        options: ['Daily', 'Several times per week', 'Once a week', 'Occasionally', 'Only when symptoms worsen']
                    }
                ]
            },
            {
                id: 'sectionC',
                title: 'SECTION C: BELIEFS & ATTITUDES TOWARD TREATMENT',
                description: 'Rate your agreement: 1=Strongly Disagree, 5=Strongly Agree',
                questions: [
                    {
                        id: 'beliefs',
                        type: 'scale',
                        required: true,
                        scale: [1, 2, 3, 4, 5],
                        items: [
                            { id: 'c1', text: 'C1. Hospital medications are effective for controlling my blood pressure' },
                            { id: 'c2', text: 'C2. Herbal remedies are effective for controlling my blood pressure' },
                            { id: 'c3', text: 'C3. Combining hospital medicine with herbs could work better than either alone' },
                            { id: 'c4', text: 'C4. I trust my doctor/nurse to make the best treatment decisions for me' },
                            { id: 'c5', text: 'C5. I trust herbal practitioners to treat my blood pressure safely' },
                            { id: 'c6', text: 'C6. Spiritual/religious practices help control blood pressure' },
                            { id: 'c7', text: 'C7. My blood pressure problem is caused by stress and worry' },
                            { id: 'c8', text: 'C8. My blood pressure problem is hereditary (runs in family)' },
                            { id: 'c9', text: 'C9. Diet and exercise can control blood pressure without medication' },
                            { id: 'c10', text: 'C10. I am satisfied with my current blood pressure treatment' }
                        ]
                    }
                ]
            },
            {
                id: 'sectionD',
                title: 'SECTION D: COMMUNICATION WITH HEALTHCARE PROVIDERS',
                questions: [
                    {
                        id: 'toldDoctor',
                        label: 'D1. Have you told your doctor about herbal remedies you use?',
                        type: 'select',
                        required: true,
                        options: ['Yes, I told them everything', 'Yes, but only some', 'No, I have not told them', 'Not applicable - I don\'t use herbs']
                    },
                    {
                        id: 'notToldReasons',
                        label: 'D2. If you have NOT told them, why not? (Select all)',
                        type: 'checkbox',
                        options: ['They didn\'t ask', 'Afraid they would disapprove', 'Don\'t think it\'s important', 'Don\'t think they would understand', 'Not applicable']
                    },
                    {
                        id: 'comfortDiscuss',
                        label: 'D3. How comfortable discussing herbal treatments with your doctor?',
                        type: 'select',
                        required: true,
                        options: ['Very comfortable', 'Somewhat comfortable', 'Neutral', 'Somewhat uncomfortable', 'Very uncomfortable']
                    }
                ]
            },
            {
                id: 'sectionE',
                title: 'SECTION E: BARRIERS TO HYPERTENSION MANAGEMENT',
                description: 'Rate impact: 1=Not at all, 5=Extremely',
                questions: [
                    {
                        id: 'barriers',
                        type: 'scale',
                        required: true,
                        scale: [1, 2, 3, 4, 5],
                        items: [
                            { id: 'e1', text: 'E1. Cost of medications' },
                            { id: 'e2', text: 'E2. Cost of clinic visits' },
                            { id: 'e3', text: 'E3. Distance to health facility' },
                            { id: 'e4', text: 'E4. Transport costs' },
                            { id: 'e5', text: 'E5. Long waiting times at clinic' },
                            { id: 'e6', text: 'E6. Medication side effects' },
                            { id: 'e7', text: 'E7. Forgetting to take medication' },
                            { id: 'e8', text: 'E8. Work/family commitments' },
                            { id: 'e9', text: 'E9. Medication not available at pharmacy' },
                            { id: 'e10', text: 'E10. Not understanding treatment instructions' }
                        ]
                    }
                ]
            },
            {
                id: 'sectionF',
                title: 'SECTION F: DIGITAL HEALTH & PERSONALIZED TREATMENT',
                questions: [
                    {
                        id: 'ownSmartphone',
                        label: 'F1. Do you own a smartphone?',
                        type: 'select',
                        required: true,
                        options: ['Yes', 'No']
                    },
                    {
                        id: 'appComfort',
                        label: 'F2. How comfortable are you using smartphone apps?',
                        type: 'select',
                        showIf: { field: 'ownSmartphone', value: 'Yes' },
                        options: ['Very comfortable - use many apps daily', 'Comfortable - use a few apps regularly', 'Neutral - can use if taught', 'Uncomfortable - rarely use apps', 'Very uncomfortable - find apps difficult']
                    },
                    {
                        id: 'usedHealthApp',
                        label: 'F3. Have you ever used a mobile health app?',
                        type: 'select',
                        showIf: { field: 'ownSmartphone', value: 'Yes' },
                        options: ['Yes', 'No']
                    },
                    {
                        id: 'willingApp',
                        label: 'F4. Would you be willing to use a mobile app to track your BP, medications, and symptoms?',
                        type: 'select',
                        required: true,
                        options: ['Very willing', 'Somewhat willing', 'Neutral', 'Somewhat unwilling', 'Very unwilling']
                    },
                    {
                        id: 'interestedStudy',
                        label: 'F5. Would you be interested in participating in a study where different treatments are tried over time to find what works best for YOU?',
                        type: 'select',
                        required: true,
                        options: ['Very interested', 'Somewhat interested', 'Neutral', 'Somewhat uninterested', 'Very uninterested']
                    },
                    {
                        id: 'valuePersonalized',
                        label: 'F6. If a mobile app could help identify which treatment works best for you personally, how valuable would that be?',
                        type: 'select',
                        required: true,
                        options: ['Extremely valuable', 'Very valuable', 'Moderately valuable', 'Slightly valuable', 'Not at all valuable']
                    }
                ]
            },
            {
                id: 'sectionG',
                title: 'SECTION G: OPENNESS TO INTEGRATIVE CARE',
                questions: [
                    {
                        id: 'followCombined',
                        label: 'G1. If your doctor recommended combining prescribed medication with specific herbal remedies, would you follow this advice?',
                        type: 'select',
                        required: true,
                        options: ['Definitely yes', 'Probably yes', 'Unsure', 'Probably no', 'Definitely no']
                    },
                    {
                        id: 'comfortCollaboration',
                        label: 'G2. Would you be comfortable if your doctor and a trained herbal practitioner worked together to manage your blood pressure?',
                        type: 'select',
                        required: true,
                        options: ['Very comfortable', 'Somewhat comfortable', 'Neutral', 'Somewhat uncomfortable', 'Very uncomfortable']
                    },
                    {
                        id: 'combineConcerns',
                        label: 'G3. What concerns, if any, would you have about combining hospital medicine with herbal treatments? (Select all)',
                        type: 'checkbox',
                        options: ['Safety/harmful interactions', 'Effectiveness might be reduced', 'Too complicated to manage', 'Increased cost', 'What family/community might think', 'Religious/cultural concerns', 'No concerns', 'Other']
                    }
                ]
            }
        ]
    },
    
    // ===== CLINICIANS QUESTIONNAIRE =====
    clinicians: {
        id: 'clinicians',
        icon: 'bi-hospital',
        title: 'Clinician Questionnaire',
        idPrefix: 'CLN',
        sections: [
            {
                id: 'meta',
                title: 'Basic Information',
                questions: [
                    { 
                        id: 'studySite', 
                        label: 'Study Site', 
                        type: 'select', 
                        required: true,
                        options: ['Tetteh Quarshie Memorial Hospital', 'Atibie Government Hospital', 'Atua Government Hospital', 'Oda Government Hospital', 'Suhum Government Hospital', 'ERHD', 'Center for Plant Medicine Research', 'Other']
                    },
                    {
                        id: 'studySiteOther',
                        label: 'Please specify study site',
                        type: 'text',
                        showIf: { field: 'studySite', value: 'Other' },
                        required: true
                    },
                    { id: 'date', label: 'Date', type: 'date', required: true },
                    { id: 'interviewer', label: 'Interviewer Initials', type: 'text', maxlength: 5, required: true }
                ]
            },
            {
                id: 'sectionA',
                title: 'SECTION A: PROFESSIONAL BACKGROUND',
                questions: [
                    {
                        id: 'role',
                        label: 'A1. Professional role',
                        type: 'select',
                        required: true,
                        options: ['Medical Doctor/Physician', 'Nurse', 'Physician Assistant', 'Pharmacist', 'Other']
                    },
                    {
                        id: 'experienceYears',
                        label: 'A2. Years of experience in healthcare',
                        type: 'select',
                        required: true,
                        options: ['Less than 1 year', '1-3 years', '4-6 years', '7-10 years', 'More than 10 years']
                    },
                    {
                        id: 'hptExperience',
                        label: 'A3. Years of experience managing hypertensive patients',
                        type: 'select',
                        required: true,
                        options: ['Less than 6 months', '6 months - 1 year', '1-3 years', '3-5 years', 'More than 5 years']
                    },
                    {
                        id: 'facilityType',
                        label: 'A4. Type of health facility where you primarily work',
                        type: 'select',
                        required: true,
                        options: ['Teaching hospital', 'Regional hospital', 'District hospital', 'Polyclinic', 'Health center', 'CHPS compound', 'Private clinic', 'Other']
                    },
                    {
                        id: 'patientsPerWeek',
                        label: 'A5. On average, how many hypertensive patients do you see per week?',
                        type: 'select',
                        required: true,
                        options: ['1-5', '6-10', '11-20', '21-50', 'More than 50']
                    }
                ]
            },
            {
                id: 'sectionB',
                title: 'SECTION B: CURRENT TREATMENT PRACTICES',
                questions: [
                    {
                        id: 'firstLineMeds',
                        label: 'B1. Most commonly prescribed first-line medications for uncomplicated hypertension? (Select up to 3)',
                        type: 'checkbox',
                        options: ['ACE inhibitors (Lisinopril, Enalapril)', 'ARBs (Losartan)', 'Calcium channel blockers (Amlodipine, Nifedipine)', 'Thiazide diuretics (Hydrochlorothiazide)', 'Beta-blockers (Atenolol, Propranolol)', 'Other']
                    },
                    {
                        id: 'bpControl',
                        label: 'B2. What percentage of your hypertensive patients achieve adequate BP control (<140/90 mmHg)?',
                        type: 'select',
                        required: true,
                        options: ['Less than 25%', '25-49%', '50-74%', '75-89%', '90% or more']
                    },
                    {
                        id: 'adherenceRate',
                        label: 'B3. What is the medication adherence rate among your hypertensive patients?',
                        type: 'select',
                        required: true,
                        options: ['Less than 25%', '25-49%', '50-74%', '75-89%', '90% or more']
                    }
                ]
            },
            {
                id: 'sectionC',
                title: 'SECTION C: OBSERVATIONS OF PATIENT BEHAVIORS',
                questions: [
                    {
                        id: 'herbalDisclosure',
                        label: 'C1. What % of your patients disclosed using herbal or traditional remedies?',
                        type: 'select',
                        required: true,
                        options: ['None (0%)', 'Very few (1-10%)', 'Some (11-30%)', 'Many (31-60%)', 'Most (61-100%)']
                    },
                    {
                        id: 'askFrequency',
                        label: 'C2. How often do you ask patients about herbal or traditional remedy use?',
                        type: 'select',
                        required: true,
                        options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never']
                    },
                    {
                        id: 'adherenceReasons',
                        label: 'C3. Most common reasons for poor medication adherence? (Select all)',
                        type: 'checkbox',
                        options: ['Cost of medications', 'Side effects', 'Forgetfulness', 'Medication not available', 'Feeling better', 'Preferring herbal remedies', 'Distance to facility', 'Cultural/religious beliefs', 'Lack of understanding', 'Other']
                    }
                ]
            },
            {
                id: 'sectionD',
                title: 'SECTION D: KNOWLEDGE & ATTITUDES TOWARD HERBAL MEDICINE',
                description: 'Rate your agreement: 1=Strongly Disagree, 5=Strongly Agree',
                questions: [
                    {
                        id: 'herbalAttitudes',
                        type: 'scale',
                        required: true,
                        scale: [1, 2, 3, 4, 5],
                        items: [
                            { id: 'd1', text: 'D1. Some herbal remedies may have antihypertensive effects' },
                            { id: 'd2', text: 'D2. Herbal medicines can be safely used alongside conventional BP medications' },
                            { id: 'd3', text: 'D3. There is insufficient scientific evidence about herbal medicines for hypertension' },
                            { id: 'd4', text: 'D4. Herbal medicines may cause harmful drug interactions' },
                            { id: 'd5', text: 'D5. Patients should inform providers about all herbal remedies they use' },
                            { id: 'd6', text: 'D6. I feel adequately trained to advise patients about herbal medicines' },
                            { id: 'd7', text: 'D7. Herbal practitioners have valuable knowledge about treating hypertension' },
                            { id: 'd8', text: 'D8. Patients\' cultural beliefs should be respected in treatment planning' }
                        ]
                    }
                ]
            },
            {
                id: 'sectionE',
                title: 'SECTION E: ATTITUDES TOWARD INTEGRATIVE CARE',
                questions: [
                    {
                        id: 'opennessIntegration',
                        label: 'E1. How open would you be to formally integrating validated herbal treatments?',
                        type: 'select',
                        required: true,
                        options: ['Very open', 'Somewhat open', 'Neutral', 'Somewhat resistant', 'Very resistant']
                    },
                    {
                        id: 'willingCollaborate',
                        label: 'E2. Would you collaborate with trained herbal practitioners in a co-management model?',
                        type: 'select',
                        required: true,
                        options: ['Definitely yes', 'Probably yes', 'Unsure', 'Probably no', 'Definitely no']
                    },
                    {
                        id: 'integrationConcerns',
                        label: 'E3. Main concerns about integrative hypertension care? (Select all)',
                        type: 'checkbox',
                        options: ['Safety and drug interactions', 'Lack of standardization', 'Insufficient evidence', 'Legal/professional liability', 'Lack of training', 'Time constraints', 'Patient safety monitoring', 'Professional credibility', 'No concerns', 'Other']
                    },
                    {
                        id: 'needsForComfort',
                        label: 'E4. What would you need to feel comfortable recommending integrative approaches? (Select all)',
                        type: 'checkbox',
                        options: ['Clinical practice guidelines', 'Training on herb-drug interactions', 'Evidence from trials', 'Standardized products', 'Clear regulatory framework', 'Collaboration protocols', 'Monitoring systems', 'Professional coverage', 'Other']
                    }
                ]
            },
            {
                id: 'sectionF',
                title: 'SECTION F: DIGITAL HEALTH & PERSONALIZED CARE',
                questions: [
                    {
                        id: 'digitalComfort',
                        label: 'F1. How comfortable are you with digital health technologies in clinical practice?',
                        type: 'select',
                        required: true,
                        options: ['Very comfortable', 'Somewhat comfortable', 'Neutral', 'Somewhat uncomfortable', 'Very uncomfortable']
                    },
                    {
                        id: 'usedDigital',
                        label: 'F2. Have you used digital platforms to monitor patient data?',
                        type: 'select',
                        required: true,
                        options: ['Yes, regularly', 'Yes, occasionally', 'No, but interested', 'No, not interested']
                    },
                    {
                        id: 'dashboardFeasibility',
                        label: 'F3. How feasible to use digital dashboard for monitoring treatment responses?',
                        type: 'select',
                        required: true,
                        options: ['Very feasible', 'Somewhat feasible', 'Neutral', 'Somewhat unfeasible', 'Very unfeasible']
                    },
                    {
                        id: 'digitalBarriers',
                        label: 'F4. Main barriers to implementing digital N-of-1 trials? (Select all)',
                        type: 'checkbox',
                        options: ['Time constraints', 'Lack of training', 'Poor connectivity', 'Lack of devices', 'Patient digital literacy', 'High workload', 'Lack of support', 'Cost', 'No barriers', 'Other']
                    },
                    {
                        id: 'personalizedValue',
                        label: 'F5. How valuable would personalized treatment data be?',
                        type: 'select',
                        required: true,
                        options: ['Extremely valuable', 'Very valuable', 'Moderately valuable', 'Slightly valuable', 'Not valuable']
                    }
                ]
            }
        ]
    },

    // ===== HERBALISTS QUESTIONNAIRE =====
    herbalists: {
        id: 'herbalists',
        icon: 'bi-flower3',
        title: 'Herbal Practitioner Questionnaire',
        idPrefix: 'HRB',
        sections: [
            {
                id: 'meta',
                title: 'Basic Information',
                questions: [
                    { 
                        id: 'studySite', 
                        label: 'Study Site', 
                        type: 'select', 
                        required: true,
                        options: ['Tetteh Quarshie Memorial Hospital', 'Atibie Government Hospital', 'Atua Government Hospital', 'Oda Government Hospital', 'Suhum Government Hospital', 'ERHD', 'Center for Plant Medicine Research', 'Other']
                    },
                    {
                        id: 'studySiteOther',
                        label: 'Please specify study site',
                        type: 'text',
                        showIf: { field: 'studySite', value: 'Other' },
                        required: true
                    },
                    { id: 'date', label: 'Date', type: 'date', required: true },
                    { id: 'interviewer', label: 'Interviewer Initials', type: 'text', maxlength: 5, required: true }
                ]
            },
            {
                id: 'sectionA',
                title: 'SECTION A: PRACTITIONER BACKGROUND',
                questions: [
                    {
                        id: 'age',
                        label: 'A1. Age Range',
                        type: 'select',
                        required: true,
                        options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
                    },
                    {
                        id: 'gender',
                        label: 'A2. Gender',
                        type: 'radio',
                        required: true,
                        options: ['Male', 'Female', 'Prefer not to say']
                    },
                    {
                        id: 'education',
                        label: 'A3. Highest level of formal education',
                        type: 'select',
                        required: true,
                        options: ['No formal education', 'Primary school', 'JHS', 'SHS', 'Tertiary/University', 'Other']
                    },
                    {
                        id: 'trainingSource',
                        label: 'A4. How did you learn herbal medicine? (Select all)',
                        type: 'checkbox',
                        options: ['Family tradition', 'Apprenticeship', 'Formal training', 'Self-taught', 'Spiritual calling', 'Other']
                    },
                    {
                        id: 'registration',
                        label: 'A5. Are you registered with CPMR or TMPC?',
                        type: 'select',
                        required: true,
                        options: ['Yes - CPMR', 'Yes - TMPC', 'Yes - Both', 'No, planning to register', 'No']
                    },
                    {
                        id: 'practiceYears',
                        label: 'A6. How many years practicing herbal medicine?',
                        type: 'select',
                        required: true,
                        options: ['Less than 1 year', '1-3 years', '4-6 years', '7-10 years', 'More than 10 years']
                    },
                    {
                        id: 'hptYears',
                        label: 'A7. Years treating patients with hypertension?',
                        type: 'select',
                        required: true,
                        options: ['Less than 6 months', '6 months - 1 year', '1-3 years', '3-5 years', 'More than 5 years']
                    }
                ]
            },
            {
                id: 'sectionB',
                title: 'SECTION B: PRACTICE CHARACTERISTICS',
                questions: [
                    {
                        id: 'practiceLocation',
                        label: 'B1. Where do you primarily practice?',
                        type: 'select',
                        required: true,
                        options: ['Own herbal clinic/shop', 'Market stall', 'Mobile practice', 'Home-based', 'Traditional medicine hospital', 'Other']
                    },
                    {
                        id: 'hptPatientsWeek',
                        label: 'B2. On average, hypertensive patients per week?',
                        type: 'select',
                        required: true,
                        options: ['1-5', '6-10', '11-20', '21-50', 'More than 50']
                    },
                    {
                        id: 'otherConditions',
                        label: 'B3. What other conditions do you commonly treat? (Select all)',
                        type: 'checkbox',
                        options: ['Diabetes', 'Arthritis/joint pain', 'Stomach problems', 'Respiratory conditions', 'Skin diseases', 'Infertility', 'Mental health', 'General wellness', 'Other']
                    }
                ]
            },
            {
                id: 'sectionC',
                title: 'SECTION C: TREATMENT PRACTICES FOR HYPERTENSION',
                questions: [
                    {
                        id: 'herbalRemedies',
                        label: 'C1. Which herbal remedies do you use for hypertension? (Select all)',
                        type: 'checkbox',
                        options: ['Garlic', 'Ginger', 'Neem', 'Moringa', 'Bitter leaf', 'African star apple', 'Prekese', 'Baobab', 'Hibiscus', 'Other']
                    },
                    {
                        id: 'prepForm',
                        label: 'C2. How do you typically prepare these? (Select all)',
                        type: 'checkbox',
                        options: ['Decoction', 'Infusion/tea', 'Powder', 'Tincture', 'Raw/fresh', 'Mixed formulation', 'Other']
                    },
                    {
                        id: 'dosageDetermination',
                        label: 'C3. How do you determine dosage for each patient?',
                        type: 'select',
                        required: true,
                        options: ['Standard dose', 'Based on age', 'Based on body size', 'Based on symptoms', 'Spiritual guidance', 'Trial and adjustment', 'Other']
                    },
                    {
                        id: 'monitoringMethod',
                        label: 'C4. How do you monitor if treatment is working?',
                        type: 'select',
                        required: true,
                        options: ['Patient feels better', 'Patient BP measurement', 'I measure BP', 'Symptom reduction', 'Spiritual confirmation', 'Other']
                    },
                    {
                        id: 'improvementRate',
                        label: 'C5. What % of hypertensive patients show improvement?',
                        type: 'select',
                        required: true,
                        options: ['Less than 25%', '25-49%', '50-74%', '75-89%', '90% or more', "Don't know"]
                    }
                ]
            },
            {
                id: 'sectionD',
                title: 'SECTION D: INTERACTIONS WITH CONVENTIONAL MEDICINE',
                questions: [
                    {
                        id: 'hospitalMedUse',
                        label: 'D1. What % of your hypertensive patients also use hospital medications?',
                        type: 'select',
                        required: true,
                        options: ['None (0%)', 'Very few (1-10%)', 'Some (11-30%)', 'Many (31-60%)', 'Most (61-100%)', "Don't know"]
                    },
                    {
                        id: 'adviceOnCombining',
                        label: 'D2. When patients use both, what do you advise? (Select all)',
                        type: 'checkbox',
                        options: ['Continue both', 'Stop hospital medicine', 'Use at different times', 'Reduce hospital dose', 'Consult doctor', 'Let patient decide', 'Other']
                    },
                    {
                        id: 'referralFrequency',
                        label: 'D3. Do you refer patients to hospitals/clinics?',
                        type: 'select',
                        required: true,
                        options: ['Yes, regularly', 'Yes, occasionally', 'Rarely', 'Never']
                    },
                    {
                        id: 'referralReasons',
                        label: 'D4. Common reasons for referral? (Select all)',
                        type: 'checkbox',
                        options: ['Not improving', 'Severe symptoms', 'Blood tests needed', 'Complications', 'Patient request', 'Other', 'Not applicable']
                    }
                ]
            },
            {
                id: 'sectionE',
                title: 'SECTION E: BELIEFS & ATTITUDES',
                description: 'Rate your agreement: 1=Strongly Disagree, 5=Strongly Agree',
                questions: [
                    {
                        id: 'beliefsAttitudes',
                        type: 'scale',
                        required: true,
                        scale: [1, 2, 3, 4, 5],
                        items: [
                            { id: 'e1', text: 'E1. Herbal medicines are more effective than hospital drugs' },
                            { id: 'e2', text: 'E2. Herbal medicines are safer than hospital drugs' },
                            { id: 'e3', text: 'E3. Combining herbs with hospital drugs could be more effective' },
                            { id: 'e4', text: 'E4. Hospital doctors respect traditional herbal medicine' },
                            { id: 'e5', text: 'E5. I would welcome collaboration with hospital clinicians' },
                            { id: 'e6', text: 'E6. Hypertension is partly caused by spiritual factors' },
                            { id: 'e7', text: 'E7. Some cases require both herbal and hospital treatment' },
                            { id: 'e8', text: 'E8. I have adequate knowledge to treat hypertension safely' }
                        ]
                    }
                ]
            },
            {
                id: 'sectionF',
                title: 'SECTION F: OPENNESS TO COLLABORATION & RESEARCH',
                questions: [
                    {
                        id: 'sharedCareModel',
                        label: 'F1. Would you work with doctors in a shared-care model?',
                        type: 'select',
                        required: true,
                        options: ['Very willing', 'Somewhat willing', 'Neutral', 'Somewhat unwilling', 'Very unwilling']
                    },
                    {
                        id: 'collaborationFacilitators',
                        label: 'F2. What would make collaboration easier? (Select all)',
                        type: 'checkbox',
                        options: ['Mutual respect', 'Clear referral protocols', 'Joint training', 'Financial incentives', 'System recognition', 'Treatment guidelines', 'Communication platform', 'Other']
                    },
                    {
                        id: 'digitalDocumentation',
                        label: 'F3. Comfort with digital data documentation?',
                        type: 'select',
                        required: true,
                        options: ['Very comfortable', 'Somewhat comfortable', 'Neutral', 'Somewhat uncomfortable', 'Very uncomfortable']
                    },
                    {
                        id: 'researchInterest',
                        label: 'F4. Interested in research on herbal treatment effectiveness?',
                        type: 'select',
                        required: true,
                        options: ['Very interested', 'Somewhat interested', 'Neutral', 'Somewhat uninterested', 'Very uninterested']
                    },
                    {
                        id: 'researchConcerns',
                        label: 'F5. Concerns about participating in research? (Select all)',
                        type: 'checkbox',
                        options: ['Time commitment', 'Sharing knowledge', 'Government control', 'Documentation burden', 'Financial costs', 'Researcher distrust', 'No concerns', 'Other']
                    }
                ]
            },
            {
                id: 'sectionG',
                title: 'SECTION G: TRAINING & CAPACITY NEEDS',
                questions: [
                    {
                        id: 'trainingNeeds',
                        label: 'G1. What training would help your practice? (Select all)',
                        type: 'checkbox',
                        options: ['BP measurement techniques', 'Complication recognition', 'Herb-drug interactions', 'Dosing guidelines', 'Record-keeping', 'Patient counseling', 'Business management', 'Digital literacy', 'Other']
                    }
                ]
            }
        ]
    },

    // ===== CAREGIVERS QUESTIONNAIRE =====
    caregivers: {
        id: 'caregivers',
        icon: 'bi-people',
        title: 'Caregiver Questionnaire',
        idPrefix: 'CG',
        sections: [
            {
                id: 'meta',
                title: 'Basic Information',
                questions: [
                    { 
                        id: 'studySite', 
                        label: 'Study Site', 
                        type: 'select', 
                        required: true,
                        options: ['Tetteh Quarshie Memorial Hospital', 'Atibie Government Hospital', 'Atua Government Hospital', 'Oda Government Hospital', 'Suhum Government Hospital', 'ERHD', 'Center for Plant Medicine Research', 'Other']
                    },
                    {
                        id: 'studySiteOther',
                        label: 'Please specify study site',
                        type: 'text',
                        showIf: { field: 'studySite', value: 'Other' },
                        required: true
                    },
                    { id: 'date', label: 'Date', type: 'date', required: true },
                    { id: 'interviewer', label: 'Interviewer Initials', type: 'text', maxlength: 5, required: true }
                ]
            },
            {
                id: 'sectionA',
                title: 'SECTION A: CAREGIVER DEMOGRAPHICS',
                questions: [
                    {
                        id: 'age',
                        label: 'A1. Age Range',
                        type: 'select',
                        required: true,
                        options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
                    },
                    {
                        id: 'gender',
                        label: 'A2. Gender',
                        type: 'radio',
                        required: true,
                        options: ['Male', 'Female', 'Prefer not to say']
                    },
                    {
                        id: 'relationship',
                        label: 'A3. Relationship to patient',
                        type: 'select',
                        required: true,
                        options: ['Spouse/Partner', 'Adult child', 'Parent', 'Sibling', 'Other family', 'Friend', 'Paid caregiver', 'Other']
                    },
                    {
                        id: 'caregivingDuration',
                        label: 'A4. How long have you been providing care?',
                        type: 'select',
                        required: true,
                        options: ['Less than 6 months', '6 months - 1 year', '1-2 years', '3-5 years', 'More than 5 years']
                    },
                    {
                        id: 'liveWithPatient',
                        label: 'A5. Do you live with the person you care for?',
                        type: 'select',
                        required: true,
                        options: ['Yes, same household', 'No, visit daily', 'No, several times/week', 'No, visit weekly', 'No, less than weekly']
                    },
                    {
                        id: 'education',
                        label: 'A6. Highest level of education',
                        type: 'select',
                        required: true,
                        options: ['No formal education', 'Primary school', 'JHS', 'SHS', 'Tertiary/University', 'Other']
                    }
                ]
            },
            {
                id: 'sectionB',
                title: 'SECTION B: CAREGIVING ACTIVITIES',
                questions: [
                    {
                        id: 'caregivingTasks',
                        label: 'B1. What caregiving tasks do you perform? (Select all)',
                        type: 'checkbox',
                        options: ['Remind to take medications', 'Help get medications', 'Accompany to clinic', 'Measure BP', 'Prepare special meals', 'Prepare herbal remedies', 'Emotional support', 'Financial support', 'Monitor symptoms', 'Other']
                    },
                    {
                        id: 'hoursPerWeek',
                        label: 'B2. On average, hours per week on caregiving?',
                        type: 'select',
                        required: true,
                        options: ['Less than 5 hours', '5-10 hours', '11-20 hours', '21-40 hours', 'More than 40 hours']
                    },
                    {
                        id: 'treatmentInvolvement',
                        label: 'B3. Are you involved in treatment decisions?',
                        type: 'select',
                        required: true,
                        options: ['Yes, very involved', 'Somewhat involved', 'Minimally involved', 'Not involved']
                    }
                ]
            },
            {
                id: 'sectionC',
                title: 'SECTION C: KNOWLEDGE & BELIEFS',
                description: 'Rate your agreement: 1=Strongly Disagree, 5=Strongly Agree',
                questions: [
                    {
                        id: 'hptUnderstanding',
                        label: 'C1. How would you rate your understanding of hypertension?',
                        type: 'select',
                        required: true,
                        options: ['Very good', 'Good', 'Fair', 'Poor', 'No understanding']
                    },
                    {
                        id: 'causesBelief',
                        label: 'C2. Main causes of relative\'s high BP? (Select all)',
                        type: 'checkbox',
                        options: ['Hereditary', 'Diet', 'Stress', 'Lack of exercise', 'Old age', 'Spiritual causes', "God's will", "Don't know", 'Other']
                    },
                    {
                        id: 'beliefsCaregiverAttitudes',
                        type: 'scale',
                        required: true,
                        scale: [1, 2, 3, 4, 5],
                        items: [
                            { id: 'c3', text: 'C3. Hypertension needs lifelong treatment' },
                            { id: 'c4', text: 'C4. Relative can feel when BP is high' },
                            { id: 'c5', text: 'C5. If controlled, medications can be stopped' },
                            { id: 'c6', text: 'C6. Diet and exercise alone can control BP' },
                            { id: 'c7', text: 'C7. Prayer and faith can cure hypertension' }
                        ]
                    }
                ]
            },
            {
                id: 'sectionD',
                title: 'SECTION D: TREATMENT PREFERENCES & PRACTICES',
                questions: [
                    {
                        id: 'treatmentsUsed',
                        label: 'D1. What treatments does relative currently use? (Select all)',
                        type: 'checkbox',
                        options: ['Hospital medications', 'Herbal remedies', 'Dietary changes', 'Exercise', 'Prayer/spiritual', 'OTC medications', 'Traditional healers', "Don't know", 'Other']
                    },
                    {
                        id: 'trustedTreatment',
                        label: 'D2. Which treatment do you personally trust most?',
                        type: 'select',
                        required: true,
                        options: ['Hospital medications', 'Herbal remedies', 'Combination', 'Prayer/spiritual', 'Lifestyle changes', "Don't know"]
                    },
                    {
                        id: 'priorityChoice',
                        label: 'D3. If resources were limited, which would you prioritize?',
                        type: 'select',
                        required: true,
                        options: ['Hospital medications', 'Herbal remedies', 'Both equally']
                    },
                    {
                        id: 'herbalUse',
                        label: 'D4. Does relative use herbal remedies?',
                        type: 'select',
                        required: true,
                        options: ['Yes, regularly', 'Yes, occasionally', 'No', "Don't know"]
                    },
                    {
                        id: 'herbKnowledge',
                        label: 'D5. Are you aware of specific herbs used?',
                        type: 'select',
                        showIf: { field: 'herbalUse', value: ['Yes, regularly', 'Yes, occasionally'] },
                        options: ['Yes, all herbs', 'Yes, some', 'No', 'Not applicable']
                    },
                    {
                        id: 'preparedHerbs',
                        label: 'D6. Have you prepared herbal remedies for relative?',
                        type: 'select',
                        options: ['Yes, regularly', 'Yes, occasionally', 'No, but would', 'No, would not']
                    }
                ]
            },
            {
                id: 'sectionE',
                title: 'SECTION E: HEALTHCARE SYSTEM INTERACTIONS',
                questions: [
                    {
                        id: 'clinicAccompany',
                        label: 'E1. How often accompany relative to clinic?',
                        type: 'select',
                        required: true,
                        options: ['Always', 'Most of the time', 'Sometimes', 'Rarely', 'Never']
                    },
                    {
                        id: 'toldDoctor',
                        label: 'E2. Has relative told doctor about herbal use?',
                        type: 'select',
                        required: true,
                        options: ['Yes', 'No', "Don't know"]
                    },
                    {
                        id: 'notToldReasons',
                        label: 'E3. Why didn\'t they tell? (Select all)',
                        type: 'checkbox',
                        options: ['Provider didn\'t ask', 'Fear of disapproval', "Don't think important", "Provider wouldn't understand", "Don't know", 'Not applicable', 'Other']
                    },
                    {
                        id: 'careQuality',
                        label: 'E4. Quality of care at health facility?',
                        type: 'select',
                        required: true,
                        options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very poor']
                    },
                    {
                        id: 'healthcareChallenges',
                        label: 'E5. Biggest challenges in getting healthcare? (Select up to 3)',
                        type: 'checkbox',
                        options: ['Medication cost', 'Clinic visit cost', 'Distance', 'Transport cost', 'Long wait times', 'Meds not available', 'Poor staff treatment', 'Difficulty getting appointments', 'Work/family conflicts', 'No challenges', 'Other']
                    }
                ]
            },
            {
                id: 'sectionF',
                title: 'SECTION F: INTEGRATIVE CARE ATTITUDES',
                description: 'Rate your agreement: 1=Strongly Disagree, 5=Strongly Agree',
                questions: [
                    {
                        id: 'combinedTreatmentSupport',
                        label: 'F1. Would you support combining hospital and herbal treatments?',
                        type: 'select',
                        required: true,
                        options: ['Definitely yes', 'Probably yes', 'Unsure', 'Probably no', 'Definitely no']
                    },
                    {
                        id: 'collaborationComfort',
                        label: 'F2. Comfortable if doctor and herbalist worked together?',
                        type: 'select',
                        required: true,
                        options: ['Very comfortable', 'Somewhat comfortable', 'Neutral', 'Somewhat uncomfortable', 'Very uncomfortable']
                    },
                    {
                        id: 'combinationConcerns',
                        label: 'F3. Concerns about combining treatments? (Select all)',
                        type: 'checkbox',
                        options: ['Safety', 'Reduced effectiveness', 'Too complicated', 'Increased cost', 'Community opinion', 'Religious concerns', "Don't trust herbalists", 'No concerns', 'Other']
                    },
                    {
                        id: 'medicineBeliefs',
                        type: 'scale',
                        required: true,
                        scale: [1, 2, 3, 4, 5],
                        items: [
                            { id: 'f4', text: 'F4. Hospital medicines more effective than herbs' },
                            { id: 'f5', text: 'F5. Herbs are safer with fewer side effects' },
                            { id: 'f6', text: 'F6. Both hospital and herbs have their place' },
                            { id: 'f7', text: 'F7. Doctors should be more open to traditional medicine' }
                        ]
                    }
                ]
            },
            {
                id: 'sectionG',
                title: 'SECTION G: DIGITAL HEALTH & SUPPORT NEEDS',
                questions: [
                    {
                        id: 'ownSmartphone',
                        label: 'G1. Do you own a smartphone?',
                        type: 'select',
                        required: true,
                        options: ['Yes', 'No']
                    },
                    {
                        id: 'willUseApp',
                        label: 'G2. Use app to track BP, meds, and symptoms?',
                        type: 'select',
                        required: true,
                        options: ['Very willing', 'Somewhat willing', 'Neutral', 'Somewhat unwilling', 'Very unwilling']
                    },
                    {
                        id: 'appComfort',
                        label: 'G3. Comfort using smartphone apps?',
                        type: 'select',
                        required: true,
                        options: ['Very comfortable', 'Comfortable', 'Neutral', 'Uncomfortable', 'Very uncomfortable']
                    },
                    {
                        id: 'studyInterest',
                        label: 'G4. Interest in study testing different treatments?',
                        type: 'select',
                        required: true,
                        options: ['Very interested', 'Somewhat interested', 'Neutral', 'Not very interested', 'Not interested']
                    },
                    {
                        id: 'supportNeeds',
                        label: 'G5. What support would help you? (Select all)',
                        type: 'checkbox',
                        options: ['Hypertension information', 'Medication training', 'Financial support', 'Transport help', 'BP monitor', 'Support groups', 'Respite care', 'Tracking app', 'Provider contact', 'Other']
                    }
                ]
            },
            {
                id: 'sectionH',
                title: 'SECTION H: CAREGIVER BURDEN',
                description: 'Rate how often you experience each: 1=Never, 5=Always',
                questions: [
                    {
                        id: 'caregiversBurden',
                        type: 'scale',
                        required: true,
                        scale: [1, 2, 3, 4, 5],
                        items: [
                            { id: 'h1', text: 'H1. I feel overwhelmed by caregiving' },
                            { id: 'h2', text: 'H2. Caregiving affects my own health' },
                            { id: 'h3', text: 'H3. I worry about relative\'s health constantly' },
                            { id: 'h4', text: 'H4. I have enough support from family/friends' },
                            { id: 'h5', text: 'H5. Caregiving causes financial strain' },
                            { id: 'h6', text: 'H6. I feel confident in my caregiving abilities' }
                        ]
                    }
                ]
            }
        ]
    },

    // ===== POLICYMAKERS QUESTIONNAIRE =====
    policymakers: {
        id: 'policymakers',
        icon: 'bi-briefcase',
        title: 'Policymaker Questionnaire',
        idPrefix: 'POL',
        sections: [
            {
                id: 'meta',
                title: 'Basic Information',
                questions: [
                    { 
                        id: 'studySite', 
                        label: 'Study Site', 
                        type: 'select', 
                        required: true,
                        options: ['Tetteh Quarshie Memorial Hospital', 'Atibie Government Hospital', 'Atua Government Hospital', 'Oda Government Hospital', 'Suhum Government Hospital', 'ERHD', 'Center for Plant Medicine Research', 'Other']
                    },
                    {
                        id: 'studySiteOther',
                        label: 'Please specify study site',
                        type: 'text',
                        showIf: { field: 'studySite', value: 'Other' },
                        required: true
                    },
                    { id: 'date', label: 'Date', type: 'date', required: true },
                    { id: 'interviewer', label: 'Interviewer Initials', type: 'text', maxlength: 5, required: true }
                ]
            },
            {
                id: 'sectionA',
                title: 'SECTION A: PROFESSIONAL BACKGROUND',
                questions: [
                    {
                        id: 'position',
                        label: 'A1. Current position/role',
                        type: 'select',
                        required: true,
                        options: ['Regional/District Health Director', 'Ministry official', 'Ghana Health Service admin', 'Policy analyst', 'Traditional Medicine Council', 'Health insurance official', 'NCD coordinator', 'Academic/researcher', 'Other']
                    },
                    {
                        id: 'yearsInRole',
                        label: 'A2. Years in current role',
                        type: 'select',
                        required: true,
                        options: ['Less than 1 year', '1-3 years', '4-6 years', '7-10 years', 'More than 10 years']
                    },
                    {
                        id: 'healthSectorYears',
                        label: 'A3. Total years in health sector',
                        type: 'select',
                        required: true,
                        options: ['Less than 5 years', '5-10 years', '11-15 years', '16-20 years', 'More than 20 years']
                    },
                    {
                        id: 'responsibilityAreas',
                        label: 'A4. Primary responsibility areas? (Select all)',
                        type: 'checkbox',
                        options: ['Policy development', 'Program implementation', 'Health financing', 'Service delivery', 'Regulation', 'Research/M&E', 'Traditional medicine', 'NCDs', 'Digital health', 'Other']
                    }
                ]
            },
            {
                id: 'sectionB',
                title: 'SECTION B: HYPERTENSION BURDEN PERSPECTIVE',
                questions: [
                    {
                        id: 'hptPriority',
                        label: 'B1. Rate hypertension as public health priority',
                        type: 'select',
                        required: true,
                        options: ['Critical priority', 'High priority', 'Moderate priority', 'Low priority', 'Not priority']
                    },
                    {
                        id: 'bpControlRate',
                        label: 'B2. % of hypertensive patients achieving BP control?',
                        type: 'select',
                        required: true,
                        options: ['Less than 25%', '25-49%', '50-74%', '75% or more', "Don't know"]
                    },
                    {
                        id: 'systemBarriers',
                        label: 'B3. Biggest health system barriers? (Select up to 3)',
                        type: 'checkbox',
                        options: ['Med stockouts', 'High costs', 'Limited staff', 'Weak referrals', 'Poor follow-up', 'Inadequate equipment', 'Provider training', 'Weak info systems', 'Low awareness', 'Other']
                    }
                ]
            },
            {
                id: 'sectionC',
                title: 'SECTION C: TRADITIONAL MEDICINE POLICY',
                description: 'Rate your agreement: 1=Strongly Disagree, 5=Strongly Agree',
                questions: [
                    {
                        id: 'traditionalMedFamiliarity',
                        label: 'C1. Familiar with Ghana\'s Traditional Medicine Policy?',
                        type: 'select',
                        required: true,
                        options: ['Very familiar', 'Somewhat familiar', 'Slightly familiar', 'Not familiar']
                    },
                    {
                        id: 'integrationLevel',
                        label: 'C2. Current traditional medicine integration in health system?',
                        type: 'select',
                        required: true,
                        options: ['Very well integrated', 'Moderately integrated', 'Poorly integrated', 'Not integrated', "Don't know"]
                    },
                    {
                        id: 'herbsRole',
                        label: 'C3. Should traditional/herbal medicine play larger role?',
                        type: 'select',
                        required: true,
                        options: ['Definitely yes', 'Probably yes', 'Unsure', 'Probably no', 'Definitely no']
                    },
                    {
                        id: 'tradMedicineBeliefs',
                        type: 'scale',
                        required: true,
                        scale: [1, 2, 3, 4, 5],
                        items: [
                            { id: 'c4', text: 'C4. Traditional medicine has evidence-based benefits' },
                            { id: 'c5', text: 'C5. Herbalists should integrate into primary care' },
                            { id: 'c6', text: 'C6. Current herbal regulations are adequate' },
                            { id: 'c7', text: 'C7. More research needed on herbal treatments' },
                            { id: 'c8', text: 'C8. Patients should choose conventional vs traditional' }
                        ]
                    }
                ]
            },
            {
                id: 'sectionD',
                title: 'SECTION D: INTEGRATIVE CARE MODELS',
                questions: [
                    {
                        id: 'integrativeFeasibility',
                        label: 'D1. Feasibility of integrative care for hypertension?',
                        type: 'select',
                        required: true,
                        options: ['Very feasible', 'Somewhat feasible', 'Neutral', 'Somewhat unfeasible', 'Very unfeasible']
                    },
                    {
                        id: 'integrationBenefits',
                        label: 'D2. Main benefits of integrative care? (Select all)',
                        type: 'checkbox',
                        options: ['Patient satisfaction', 'Better adherence', 'Culturally appropriate', 'Increased access', 'Reduced costs', 'Better outcomes', 'Fewer side effects', 'No benefits', 'Other']
                    },
                    {
                        id: 'integrationChallenges',
                        label: 'D3. Main challenges? (Select all)',
                        type: 'checkbox',
                        options: ['Safety concerns', 'Lack standardization', 'Insufficient evidence', 'Provider resistance', 'Regulatory gaps', 'Quality control', 'Training needs', 'Funding', 'M&E difficulties', 'Liability', 'Other']
                    },
                    {
                        id: 'policyChanges',
                        label: 'D4. Policy changes needed? (Select all)',
                        type: 'checkbox',
                        options: ['National guidelines', 'Training curricula', 'Quality standards', 'Practice regulations', 'NHIS coverage', 'Collaboration frameworks', 'Adverse event systems', 'Research funding', 'Public education', 'Other']
                    }
                ]
            },
            {
                id: 'sectionE',
                title: 'SECTION E: DIGITAL HEALTH & INNOVATION',
                description: 'Rate your agreement: 1=Strongly Disagree, 5=Strongly Agree',
                questions: [
                    {
                        id: 'digitalFamiliarity',
                        label: 'E1. Familiar with digital health innovations?',
                        type: 'select',
                        required: true,
                        options: ['Very familiar', 'Somewhat familiar', 'Slightly familiar', 'Not familiar']
                    },
                    {
                        id: 'nof1Awareness',
                        label: 'E2. Aware of N-of-1 trials (personalized experiments)?',
                        type: 'select',
                        required: true,
                        options: ['Yes, very familiar', 'Yes, somewhat familiar', 'Heard of it', 'Not aware']
                    },
                    {
                        id: 'nof1Promising',
                        label: 'E3. How promising are digital N-of-1 trials?',
                        type: 'select',
                        required: true,
                        options: ['Very promising', 'Somewhat promising', 'Neutral', 'Not very promising', 'Not promising', "Don't know enough"]
                    },
                    {
                        id: 'digitalBarriers',
                        label: 'E4. Main barriers to digital health solutions? (Select all)',
                        type: 'checkbox',
                        options: ['Limited infrastructure', 'Low digital literacy', 'Data privacy concerns', 'Technology cost', 'Policy gaps', 'Provider resistance', 'Tech support', 'Power supply', 'No barriers', 'Other']
                    },
                    {
                        id: 'digitalBeliefs',
                        type: 'scale',
                        required: true,
                        scale: [1, 2, 3, 4, 5],
                        items: [
                            { id: 'e5', text: 'E5. Digital health should be prioritized' },
                            { id: 'e6', text: 'E6. mHealth apps improve medication adherence' },
                            { id: 'e7', text: 'E7. Ghana infrastructure can support mHealth' },
                            { id: 'e8', text: 'E8. Digital data can inform policy' }
                        ]
                    }
                ]
            },
            {
                id: 'sectionF',
                title: 'SECTION F: PERSONALIZED MEDICINE',
                questions: [
                    {
                        id: 'personalizedImportance',
                        label: 'F1. Importance of personalized medicine for outcomes?',
                        type: 'select',
                        required: true,
                        options: ['Extremely important', 'Very important', 'Moderately important', 'Slightly important', 'Not important']
                    },
                    {
                        id: 'personalizedFeasibility',
                        label: 'F2. Feasible in Ghana\'s current health system?',
                        type: 'select',
                        required: true,
                        options: ['Yes, very feasible', 'Somewhat feasible', 'Not now but future', 'Not feasible']
                    },
                    {
                        id: 'personalizedResources',
                        label: 'F3. Resources needed for personalized care? (Select all)',
                        type: 'checkbox',
                        options: ['Decision support', 'Provider training', 'Data systems', 'Point-of-care diagnostics', 'Consultation time', 'Patient education', 'Technology funding', 'Policy guidelines', 'Other']
                    }
                ]
            },
            {
                id: 'sectionG',
                title: 'SECTION G: RESEARCH & EVIDENCE',
                questions: [
                    {
                        id: 'localEvidenceImportance',
                        label: 'G1. Importance of local evidence on integrative treatments?',
                        type: 'select',
                        required: true,
                        options: ['Extremely important', 'Very important', 'Moderately important', 'Slightly important', 'Not important']
                    },
                    {
                        id: 'integrationPilot',
                        label: 'G2. Support piloting integrative care models?',
                        type: 'select',
                        required: true,
                        options: ['Strongly support', 'Somewhat support', 'Neutral', 'Somewhat oppose', 'Strongly oppose']
                    },
                    {
                        id: 'persuasiveEvidence',
                        label: 'G3. Most persuasive evidence for policy? (Select top 3)',
                        type: 'checkbox',
                        options: ['RCTs', 'Cost-effectiveness', 'Implementation research', 'Patient satisfaction', 'Clinical outcomes', 'Safety/adverse events', 'Health system impact']
                    },
                    {
                        id: 'researchLead',
                        label: 'G4. Who should lead research? (Select all)',
                        type: 'checkbox',
                        options: ['Academic institutions', 'Ghana Health Service', 'Traditional Med Council', 'Plant Medicine Centre', 'International partners', 'Private sector', 'Multi-stakeholder consortium', 'Other']
                    }
                ]
            },
            {
                id: 'sectionH',
                title: 'SECTION H: IMPLEMENTATION PRIORITIES',
                questions: [
                    {
                        id: 'implementationReadiness',
                        label: 'H1. Readiness to support hypertension care innovations?',
                        type: 'select',
                        required: true,
                        options: ['Very ready', 'Somewhat ready', 'Neutral', 'Not very ready', 'Not ready']
                    },
                    {
                        id: 'adoptionFacilitators',
                        label: 'H2. What facilitates adoption? (Select all)',
                        type: 'checkbox',
                        options: ['Pilot projects', 'Implementation guidelines', 'Training/mentorship', 'Dedicated funding', 'Political commitment', 'Community engagement', 'Stakeholder buy-in', 'M&E support', 'Other']
                    }
                ]
            }
        ]
    },

    // Data view tab
    data: {
        id: 'data',
        icon: 'bi-database',
        title: 'Collected Data',
        isDataView: true
    }
};

// Make QUESTIONNAIRES available globally
if (typeof window !== 'undefined') {
    window.QUESTIONNAIRES = QUESTIONNAIRES;
}
