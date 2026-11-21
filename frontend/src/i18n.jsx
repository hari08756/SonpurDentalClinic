import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const hindi = {
  'Home': 'होम', 'Our care': 'हमारी सेवाएँ', 'Track booking': 'बुकिंग की स्थिति',
  'Book appointment': 'अपॉइंटमेंट बुक करें', 'Care for every smile.': 'हर मुस्कान की देखभाल।',
  'Secure appointment requests': 'सुरक्षित अपॉइंटमेंट अनुरोध', 'Clinic admin': 'क्लिनिक एडमिन',
  'All rights reserved.': 'सर्वाधिकार सुरक्षित।', 'A healthier smile starts here': 'स्वस्थ मुस्कान की शुरुआत यहाँ से',
  'Make room for a': 'अपनी मुस्कान को दें', 'brighter': 'नई चमक', 'smile.': 'और खूबसूरती।',
  'Thoughtful dental care, a comfortable clinic experience, and easy appointment booking — all in one place.': 'बेहतर दंत चिकित्सा, आरामदायक क्लिनिक का अनुभव और आसान अपॉइंटमेंट बुकिंग — सब एक ही जगह।',
  'Book an appointment': 'अपॉइंटमेंट बुक करें', 'Explore our care': 'हमारी सेवाएँ देखें',
  'Simple online booking': 'आसान ऑनलाइन बुकिंग', 'Choose a time that works for you': 'अपनी सुविधा के अनुसार समय चुनें',
  'Easy booking': 'आसान बुकिंग', 'Pick your preferred slot': 'अपना पसंदीदा समय चुनें',
  'Personal verification': 'भुगतान की जाँच', 'Booking confirmed by clinic': 'क्लिनिक द्वारा बुकिंग की पुष्टि',
  'YOUR SMILE, OUR PRIORITY': 'आपकी मुस्कान, हमारी प्राथमिकता', 'Care that feels good.': 'आरामदायक और भरोसेमंद देखभाल।',
  'PERSONAL CARE': 'व्यक्तिगत देखभाल', 'CONVENIENT APPOINTMENTS': 'आसान अपॉइंटमेंट', 'SMILE WITH CONFIDENCE': 'आत्मविश्वास से मुस्कुराएँ',
  'Clinic timings': 'क्लिनिक का समय', 'Appointment hours': 'अपॉइंटमेंट का समय', 'Visit our clinic': 'हमारे क्लिनिक आएँ',
  'Clinic location': 'क्लिनिक का पता', 'Online booking fee': 'ऑनलाइन बुकिंग शुल्क',
  'CARE THAT COMES FIRST': 'देखभाल सबसे पहले', 'Here for your': 'आपकी', 'everyday smile.': 'हर दिन की मुस्कान के लिए।',
  'A simple, welcoming experience for your dental care needs.': 'आपकी दाँतों की देखभाल के लिए सरल और सहज अनुभव।',
  'Keep your smile healthy': 'अपनी मुस्कान स्वस्थ रखें', 'Regular dental check-ups and guidance to help you care for your teeth.': 'दाँतों की देखभाल के लिए नियमित जाँच और सही सलाह।',
  'Care when you need it': 'ज़रूरत के समय सही देखभाल', 'Get the right attention for your dental concerns.': 'दाँतों से जुड़ी समस्याओं के लिए उचित देखभाल पाएँ।',
  'A visit made around you': 'आपकी सुविधा के अनुसार मुलाक़ात', 'Choose an available time and share your concern before you visit.': 'उपलब्ध समय चुनें और आने से पहले अपनी समस्या बताएँ।',
  'YOUR NEXT STEP': 'आपका अगला कदम', 'A little time for your smile': 'अपनी मुस्कान के लिए थोड़ा समय', 'can make a big difference.': 'बहुत बड़ा बदलाव ला सकता है।',
  'Book online in a few simple steps.': 'कुछ आसान चरणों में ऑनलाइन बुकिंग करें।', 'Find an appointment': 'अपॉइंटमेंट का समय देखें',
  'HOW IT WORKS': 'यह कैसे काम करता है', 'Booking, made': 'बुकिंग हुई', 'simple.': 'आसान।',
  'Choose a slot': 'समय चुनें', 'Pick an available date and appointment time.': 'उपलब्ध तारीख और अपॉइंटमेंट का समय चुनें।',
  'Pay the booking fee': 'बुकिंग शुल्क जमा करें', 'Scan the clinic QR and upload your payment screenshot.': 'क्लिनिक का QR स्कैन करें और भुगतान का स्क्रीनशॉट अपलोड करें।',
  'Get confirmation': 'पुष्टि प्राप्त करें', 'The clinic verifies your payment and confirms your visit.': 'क्लिनिक भुगतान की जाँच करके आपकी अपॉइंटमेंट की पुष्टि करेगा।',
  'Preparing appointment booking…': 'अपॉइंटमेंट बुकिंग तैयार हो रही है…', 'Unable to load clinic settings. Please refresh the page.': 'क्लिनिक की जानकारी नहीं मिल सकी। कृपया पेज रिफ्रेश करें।',
  'SONPUR DENTAL CLINIC': 'सोनपुर डेंटल क्लिनिक', 'Your smile deserves': 'आपकी मुस्कान को चाहिए', 'time and care.': 'समय और देखभाल।',
  'Reserve a convenient appointment in just a few steps. The clinic will confirm your booking after checking your payment.': 'कुछ आसान चरणों में अपनी सुविधानुसार अपॉइंटमेंट बुक करें। भुगतान की जाँच के बाद क्लिनिक आपकी बुकिंग की पुष्टि करेगा।',
  'Your personal details are used only to manage this appointment request.': 'आपकी निजी जानकारी का उपयोग केवल इस अपॉइंटमेंट अनुरोध के लिए किया जाएगा।',
  'Need help?': 'मदद चाहिए?', 'Contact the clinic for assistance.': 'सहायता के लिए क्लिनिक से संपर्क करें।',
  'ONLINE APPOINTMENT': 'ऑनलाइन अपॉइंटमेंट', 'Choose your visit': 'अपनी मुलाक़ात चुनें', 'Complete your payment': 'भुगतान पूरा करें', 'Request submitted': 'अनुरोध भेज दिया गया',
  'Appointment date and time': 'अपॉइंटमेंट की तारीख और समय', 'Select a date': 'तारीख चुनें', 'Available time slots': 'उपलब्ध समय स्लॉट',
  'Choose your preferred available time slot.': 'उपलब्ध समय में से अपनी सुविधा का स्लॉट चुनें।', 'Checking availability…': 'उपलब्धता देखी जा रही है…',
  'No slots available on this date': 'इस तारीख को कोई समय उपलब्ध नहीं है', 'Choose another date or contact the clinic.': 'दूसरी तारीख चुनें या क्लिनिक से संपर्क करें।',
  'Your details': 'आपकी जानकारी', 'Full name': 'पूरा नाम', 'Enter patient name': 'मरीज़ का नाम लिखें',
  'Mobile number': 'मोबाइल नंबर', '10-digit number': '10 अंकों का मोबाइल नंबर', 'Hour': 'घंटा', 'Minute': 'मिनट', 'An account already exists with this mobile number. Please log in.': 'इस मोबाइल नंबर से पहले ही अकाउंट बना हुआ है। कृपया लॉगिन करें।', 'Age': 'उम्र', '(optional)': '(वैकल्पिक)',
  'Patient age': 'मरीज़ की उम्र', 'What would you like help with?': 'आपको दाँतों से जुड़ी क्या परेशानी है?',
  'Briefly describe your dental concern': 'अपनी समस्या संक्षेप में बताएँ', 'Appointment booking fee': 'अपॉइंटमेंट बुकिंग शुल्क',
  'Pay by scanning the clinic QR': 'क्लिनिक का QR स्कैन करके भुगतान करें', 'Creating request…': 'अनुरोध बनाया जा रहा है…',
  'Continue to payment': 'भुगतान के लिए आगे बढ़ें', 'Your appointment is not confirmed until the clinic verifies your payment.': 'क्लिनिक द्वारा भुगतान की पुष्टि होने तक आपकी अपॉइंटमेंट पक्की नहीं है।',
  'YOUR BOOKING ID': 'आपकी बुकिंग आईडी', 'Amount to pay': 'जमा करने की राशि', 'Scan & pay using any UPI app': 'किसी भी UPI ऐप से स्कैन करके भुगतान करें',
  'Pay exactly': 'ठीक इतनी राशि जमा करें', 'to the clinic QR code. Save a screenshot after successful payment.': 'क्लिनिक के QR कोड पर। भुगतान के बाद स्क्रीनशॉट सुरक्षित रखें।',
  'Clinic QR is not uploaded yet': 'क्लिनिक का QR अभी अपलोड नहीं हुआ है', 'Please contact the clinic before making payment. An administrator needs to add the QR code first.': 'भुगतान करने से पहले क्लिनिक से संपर्क करें। पहले एडमिन को QR कोड अपलोड करना होगा।',
  'UPI transaction / reference ID': 'UPI ट्रांज़ैक्शन / रेफरेंस आईडी', 'Enter UPI transaction ID': 'UPI ट्रांज़ैक्शन आईडी लिखें',
  'Payment screenshot': 'भुगतान का स्क्रीनशॉट', '(JPG, PNG or WEBP · max 5 MB)': '(JPG, PNG या WEBP · अधिकतम 5 MB)',
  'Choose payment screenshot': 'भुगतान का स्क्रीनशॉट चुनें', 'Selected file': 'फ़ाइल चुनी गई', 'Tap to upload from your device': 'अपने डिवाइस से फ़ाइल अपलोड करें',
  'Submitting proof…': 'भुगतान का प्रमाण भेजा जा रहा है…', 'Submit payment for verification': 'जाँच के लिए भुगतान भेजें',
  'Back to appointment details': 'अपॉइंटमेंट की जानकारी पर वापस जाएँ', 'Payment proof submitted!': 'भुगतान का प्रमाण भेज दिया गया!',
  'Your booking request is now waiting for manual verification by Sonpur Dental Clinic.': 'आपकी बुकिंग अब सोनपुर डेंटल क्लिनिक द्वारा मैन्युअल जाँच की प्रतीक्षा में है।',
  'Booking ID': 'बुकिंग आईडी', 'Appointment': 'अपॉइंटमेंट', 'Payment': 'भुगतान', 'Under review': 'जाँच जारी है',
  'Track appointment status': 'अपॉइंटमेंट की स्थिति देखें', 'Please keep your booking ID for future reference.': 'कृपया अपनी बुकिंग आईडी भविष्य के लिए सुरक्षित रखें।',
  'Payment proof has been submitted. The clinic will verify it shortly.': 'भुगतान का प्रमाण भेज दिया गया है। क्लिनिक जल्द ही इसकी जाँच करेगा।',
  'Track your': 'अपनी', 'appointment.': 'अपॉइंटमेंट की स्थिति देखें।', 'BOOKING ASSISTANT': 'बुकिंग सहायता',
  'Enter the booking ID shown after you submit your appointment request.': 'अपॉइंटमेंट अनुरोध भेजने के बाद मिली बुकिंग आईडी लिखें।',
  'Example: SDC-1234567': 'उदाहरण: SDC-1234567', 'Check status': 'स्थिति देखें', 'Checking…': 'जाँच हो रही है…',
  'Finding your appointment…': 'आपकी अपॉइंटमेंट खोजी जा रही है…', 'Enter your booking ID first.': 'पहले अपनी बुकिंग आईडी लिखें।',
  'Awaiting payment proof': 'भुगतान के प्रमाण की प्रतीक्षा', 'Your appointment request has been created. Complete payment and upload the screenshot to continue.': 'आपका अपॉइंटमेंट अनुरोध बन गया है। आगे बढ़ने के लिए भुगतान करें और स्क्रीनशॉट अपलोड करें।',
  'Payment under verification': 'भुगतान की जाँच जारी है', 'The clinic has received your payment screenshot. Your appointment will be confirmed after manual verification.': 'क्लिनिक को आपका भुगतान स्क्रीनशॉट मिल गया है। मैन्युअल जाँच के बाद अपॉइंटमेंट की पुष्टि होगी।',
  'Appointment confirmed': 'अपॉइंटमेंट की पुष्टि हो गई', 'Your payment has been verified. Please arrive at the clinic on your selected date and time.': 'आपका भुगतान सत्यापित हो गया है। कृपया चुनी गई तारीख और समय पर क्लिनिक पहुँचें।',
  'Payment request rejected': 'भुगतान अनुरोध अस्वीकार हुआ', 'The clinic could not verify this payment. Please contact the clinic for assistance.': 'क्लिनिक इस भुगतान की पुष्टि नहीं कर सका। कृपया सहायता के लिए क्लिनिक से संपर्क करें।',
  'Appointment cancelled': 'अपॉइंटमेंट रद्द हो गई', 'This appointment is no longer active. Please make a new booking if needed.': 'यह अपॉइंटमेंट अब सक्रिय नहीं है। ज़रूरत हो तो नई बुकिंग करें।',
  'Patient': 'मरीज़', 'Date': 'तारीख', 'Time': 'समय', 'Booking fee': 'बुकिंग शुल्क',
  'Payment reference': 'भुगतान रेफरेंस', 'Not submitted': 'अभी जमा नहीं हुआ', 'Complete your booking payment': 'बुकिंग का भुगतान पूरा करें',
  'Clinic QR not available': 'क्लिनिक का QR उपलब्ध नहीं है', 'Please contact the clinic before making payment.': 'भुगतान करने से पहले क्लिनिक से संपर्क करें।',
  'Payment proof submitted. The clinic will verify your payment shortly.': 'भुगतान का प्रमाण भेज दिया गया है। क्लिनिक जल्द ही इसकी जाँच करेगा।',
  'Submit payment for verification': 'जाँच के लिए भुगतान भेजें', 'Your appointment status and visit details will appear here.': 'आपकी अपॉइंटमेंट की स्थिति और जानकारी यहाँ दिखाई देगी।',
  'Having trouble finding your booking? Contact Sonpur Dental Clinic and share the mobile number used at booking.': 'बुकिंग खोजने में परेशानी हो रही है? सोनपुर डेंटल क्लिनिक से संपर्क करें और बुकिंग में दिया गया मोबाइल नंबर बताएँ।',
  'English': 'English', 'Hindi': 'हिन्दी', 'Change language': 'भाषा बदलें',
  'Loading clinic details…': 'क्लिनिक की जानकारी लोड हो रही है…', 'From': 'शुरुआत', 'available': 'उपलब्ध', 'onwards': 'से',
  'Your selected time': 'आपका चुना हुआ समय',
  'Choose how to select your time': 'समय चुनने का तरीका चुनें',
  'Choose from available slots': 'उपलब्ध स्लॉट में से चुनें',
  'Use a time published by the clinic': 'क्लिनिक द्वारा दिए गए समय में से चुनें',
  'Choose my own time': 'अपना समय खुद चुनें',
  'Enter a time that suits you': 'अपनी सुविधा के अनुसार समय दर्ज करें',
  'Select your preferred time': 'अपनी पसंद का समय चुनें',
  'You can request a time even if it is not listed above. The clinic will check and confirm availability.': 'सूची में न होने वाला समय भी अनुरोध कर सकते हैं। क्लिनिक उपलब्धता जाँचकर पुष्टि करेगा।',
  'Your requested time': 'आपका अनुरोधित समय',
  'You can choose your own time using the option above.': 'ऊपर दिए विकल्प से आप अपना समय खुद चुन सकते हैं।',
  'Choose a future appointment date and time': 'कृपया भविष्य की तारीख और समय चुनें',
  'Choose an available slot or enter both a date and a preferred time': 'उपलब्ध स्लॉट चुनें या तारीख और अपनी पसंद का समय दोनों दर्ज करें',
  'PREVENTIVE': 'निवारक देखभाल', 'RESTORATIVE': 'उपचार', 'PERSONAL': 'व्यक्तिगत देखभाल',
  'Scan this clinic QR using any UPI app. Save the payment screenshot after successful payment.': 'किसी भी UPI ऐप से क्लिनिक का QR स्कैन करें। भुगतान सफल होने पर स्क्रीनशॉट सुरक्षित रखें।',
  'PREPARING': 'तैयारी जारी है', 'Please keep your booking ID for future reference.': 'कृपया अपनी बुकिंग आईडी भविष्य के लिए सुरक्षित रखें।',
  'No slots available on this date': 'इस तारीख को कोई स्लॉट उपलब्ध नहीं है',
  'Request submitted': 'अनुरोध भेज दिया गया', 'Your selected time': 'आपका चुना हुआ समय',
  'Enter a valid 10-digit Indian mobile number': 'कृपया 10 अंकों का सही भारतीय मोबाइल नंबर लिखें',
  'Selected time slot was not found': 'चुना हुआ समय उपलब्ध नहीं है',
  'This time slot is no longer available': 'यह समय अब उपलब्ध नहीं है',
  'This time slot has just been booked. Please choose another time.': 'यह समय अभी बुक हो गया है। कृपया दूसरा समय चुनें।',
  'Booking ID not found': 'बुकिंग आईडी नहीं मिली',
  'Enter a valid UPI transaction/reference ID': 'सही UPI ट्रांज़ैक्शन / रेफरेंस आईडी लिखें',
  'Payment proof cannot be changed for this booking': 'इस बुकिंग के भुगतान प्रमाण में बदलाव नहीं किया जा सकता',
  'Please select an image file': 'कृपया इमेज फ़ाइल चुनें',
  'Image must be 5 MB or smaller': 'इमेज का आकार 5 MB या उससे कम होना चाहिए',
  'Only JPG, PNG and WEBP images are supported': 'केवल JPG, PNG और WEBP इमेज स्वीकार हैं',
  'PATIENT PORTAL': 'मरीज़ पोर्टल', 'Create your patient account': 'अपना मरीज़ अकाउंट बनाएँ',
  'Register to keep all your clinic appointments together.': 'अपनी सभी क्लिनिक अपॉइंटमेंट एक जगह देखने के लिए रजिस्टर करें।',
  'Welcome back': 'वापसी पर स्वागत है', 'Log in to track your appointments and manage upcoming visits.': 'अपनी अपॉइंटमेंट की स्थिति देखने और आगामी मुलाक़ातों को प्रबंधित करने के लिए लॉगिन करें।',
  'Password': 'पासवर्ड', 'Confirm password': 'पासवर्ड की पुष्टि करें', 'Create a password (min. 8 characters)': 'पासवर्ड बनाएँ (कम से कम 8 अक्षर)',
  'Re-enter your password': 'पासवर्ड फिर से लिखें', 'Create account': 'अकाउंट बनाएँ', 'Log in': 'लॉगिन करें',
  'Please wait…': 'कृपया प्रतीक्षा करें…', 'Already have an account?': 'क्या आपका पहले से अकाउंट है?',
  'New to the patient portal?': 'क्या आप पहली बार मरीज़ पोर्टल का उपयोग कर रहे हैं?', 'Create an account': 'अकाउंट बनाएँ',
  'Back to clinic website': 'क्लिनिक वेबसाइट पर वापस जाएँ', 'My account': 'मेरा अकाउंट', 'Patient login': 'मरीज़ लॉगिन',
  'Your password is securely hashed. Use a mobile number you can access.': 'आपका पासवर्ड सुरक्षित रूप से हैश किया जाता है। ऐसा मोबाइल नंबर उपयोग करें जिस तक आपकी पहुँच हो।',
  'Passwords do not match.': 'दोनों पासवर्ड मेल नहीं खाते।', 'An account already exists for this mobile number. Please log in.': 'इस मोबाइल नंबर से अकाउंट पहले से मौजूद है। कृपया लॉगिन करें।',
  'Incorrect mobile number or password': 'मोबाइल नंबर या पासवर्ड गलत है', 'Patient login required': 'मरीज़ लॉगिन आवश्यक है',
  'Loading your patient dashboard…': 'आपका मरीज़ डैशबोर्ड लोड हो रहा है…', 'Hello': 'नमस्ते',
  'Your appointments, payment progress and visit details in one place.': 'आपकी अपॉइंटमेंट, भुगतान की स्थिति और मुलाक़ात की जानकारी एक ही जगह।',
  'Refresh': 'रिफ्रेश करें', 'Log out': 'लॉग आउट', 'Patient account': 'मरीज़ अकाउंट',
  'Total appointments': 'कुल अपॉइंटमेंट', 'Upcoming visits': 'आगामी मुलाक़ातें', 'Confirmed': 'पुष्टि की गई', 'Cancelled': 'रद्द',
  'YOUR RECORD': 'आपका रिकॉर्ड', 'Appointment history': 'अपॉइंटमेंट इतिहास', 'Track progress or manage an upcoming appointment.': 'अपनी अपॉइंटमेंट की स्थिति देखें या आगामी अपॉइंटमेंट प्रबंधित करें।',
  'Appointment date': 'अपॉइंटमेंट की तारीख', 'Request created': 'अनुरोध बनाया गया', 'Payment submitted': 'भुगतान जमा किया गया',
  'View booking details': 'बुकिंग विवरण देखें', 'Continue payment': 'भुगतान जारी रखें', 'Cancel appointment': 'अपॉइंटमेंट रद्द करें',
  'Why are you cancelling this appointment?': 'आप यह अपॉइंटमेंट क्यों रद्द कर रहे हैं?', 'Enter your reason': 'रद्द करने का कारण लिखें',
  'Confirm cancellation': 'रद्द करने की पुष्टि करें', 'Keep appointment': 'अपॉइंटमेंट रहने दें', 'Cancelling…': 'रद्द किया जा रहा है…',
  'Please enter a cancellation reason.': 'कृपया रद्द करने का कारण लिखें।', 'Appointment cancelled. The time slot has been released.': 'अपॉइंटमेंट रद्द हो गई है। समय स्लॉट फिर से उपलब्ध कर दिया गया है।',
  'Any payment refund, if applicable, is handled by the clinic separately.': 'यदि भुगतान वापसी लागू होती है, तो क्लिनिक इसे अलग से संभालेगा।',
  'No appointments yet': 'अभी कोई अपॉइंटमेंट नहीं है', 'Once you book an appointment using this mobile number, it will appear here.': 'इस मोबाइल नंबर से अपॉइंटमेंट बुक करने के बाद वह यहाँ दिखाई देगी।',
  'Book your first appointment': 'पहली अपॉइंटमेंट बुक करें', 'Open patient dashboard': 'मरीज़ डैशबोर्ड खोलें', 'Appointment cancelled': 'अपॉइंटमेंट रद्द हो गई', 'Reason': 'कारण',
  'Appointment status and visit details in one place.': 'अपॉइंटमेंट की स्थिति और मुलाक़ात का विवरण एक ही जगह।',
  'Registered patient logins': 'रजिस्टर्ड मरीज़ अकाउंट', 'Patient account linked': 'मरीज़ अकाउंट से जुड़ा हुआ',
  'Cancellation reason:': 'रद्द करने का कारण:', 'The appointment mobile number must match your logged-in account.': 'अपॉइंटमेंट का मोबाइल नंबर आपके लॉगिन अकाउंट से मेल खाना चाहिए।',
  'Past appointments cannot be cancelled online': 'पुरानी अपॉइंटमेंट ऑनलाइन रद्द नहीं की जा सकती',
  'This appointment can no longer be cancelled': 'यह अपॉइंटमेंट अब रद्द नहीं की जा सकती',
  'Appointment not found for this patient account': 'इस मरीज़ अकाउंट के लिए अपॉइंटमेंट नहीं मिली',
  'Edit profile': 'प्रोफ़ाइल संपादित करें', 'ACCOUNT SETTINGS': 'अकाउंट सेटिंग्स', 'Update your details': 'अपनी जानकारी अपडेट करें',
  'Changes to your mobile number will also update your linked appointment records.': 'मोबाइल नंबर बदलने पर उससे जुड़ी अपॉइंटमेंट की जानकारी भी अपडेट होगी।',
  'Email address (optional)': 'ईमेल पता (वैकल्पिक)', 'Enter your email address': 'अपना ईमेल पता लिखें',
  'Current password': 'वर्तमान पासवर्ड', 'New password (optional)': 'नया पासवर्ड (वैकल्पिक)',
  'Leave blank to keep current password': 'मौजूदा पासवर्ड रखने के लिए खाली छोड़ें', 'Save profile': 'प्रोफ़ाइल सेव करें',
  'Profile details updated successfully.': 'प्रोफ़ाइल की जानकारी सफलतापूर्वक अपडेट हो गई।', 'Saving…': 'सेव किया जा रहा है…',
  'Update profile': 'प्रोफ़ाइल अपडेट करें', 'Close': 'बंद करें', 'Cancel': 'रद्द करें',
  'Please log in or create your one patient account to book an appointment.': 'अपॉइंटमेंट बुक करने के लिए कृपया लॉगिन करें या अपना एक मरीज़ अकाउंट बनाएँ।',
  'Your password is securely hashed. Only one patient account can be created for each 10-digit mobile number. If you already registered, log in instead.': 'आपका पासवर्ड सुरक्षित रूप से हैश किया जाता है। प्रत्येक 10 अंकों के मोबाइल नंबर पर केवल एक मरीज़ अकाउंट बनाया जा सकता है। पहले से रजिस्टर हैं तो लॉगिन करें।',
  'Unable to load your patient account': 'आपका मरीज़ अकाउंट लोड नहीं हो सका',
  'Please log in again before booking an appointment.': 'अपॉइंटमेंट बुक करने से पहले कृपया दोबारा लॉगिन करें।',
  'Preparing your secure appointment booking…': 'आपकी सुरक्षित अपॉइंटमेंट बुकिंग तैयार की जा रही है…',
  'Booking with your patient account': 'आपके मरीज़ अकाउंट से बुकिंग',
  'Registered mobile number': 'रजिस्टर्ड मोबाइल नंबर',
  'Update account details': 'अकाउंट की जानकारी अपडेट करें',
  'Log in or create the patient account registered with this appointment to submit payment proof. Only the account that owns this booking can upload payment details.': 'भुगतान का प्रमाण भेजने के लिए इस अपॉइंटमेंट से जुड़े मरीज़ अकाउंट में लॉगिन करें या वही अकाउंट बनाएँ। केवल इस बुकिंग का मालिक अकाउंट ही भुगतान विवरण अपलोड कर सकता है।',
  'Log in or create one patient account with your mobile number before booking.': 'बुकिंग से पहले अपने मोबाइल नंबर से लॉगिन करें या एक मरीज़ अकाउंट बनाएँ।',
  'Please log in or create a patient account before booking an appointment.': 'अपॉइंटमेंट बुक करने से पहले कृपया लॉगिन करें या मरीज़ अकाउंट बनाएँ।',
  'Please log in to the patient account that owns this appointment before submitting payment proof.': 'भुगतान प्रमाण भेजने से पहले कृपया उसी मरीज़ अकाउंट में लॉगिन करें जिससे यह अपॉइंटमेंट जुड़ी है।'
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try { return localStorage.getItem('sdc_language') || 'hi' } catch { return 'hi' }
  })
  const setLanguage = (next) => {
    const safe = next === 'en' ? 'en' : 'hi'
    setLanguageState(safe)
    try { localStorage.setItem('sdc_language', safe) } catch { /* storage may be disabled */ }
  }
  useEffect(() => {
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en'
    const description = document.querySelector('meta[name="description"]')
    if (description) description.content = language === 'hi'
      ? 'सोनपुर डेंटल क्लिनिक में अपनी दंत चिकित्सा अपॉइंटमेंट ऑनलाइन बुक करें।'
      : 'Book your dental appointment at Sonpur Dental Clinic.'
  }, [language])
  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (text) => language === 'hi' ? (hindi[text] || text) : text
  }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used within LanguageProvider')
  return value
}

export function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage, t } = useLanguage()
  return <button type="button" className={`language-switcher${compact ? ' compact' : ''}`} onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')} aria-label={t('Change language')} title={t('Change language')}>
    <span className="language-globe" aria-hidden="true">文</span>{language === 'hi' ? 'English' : 'हिन्दी'}
  </button>
}
