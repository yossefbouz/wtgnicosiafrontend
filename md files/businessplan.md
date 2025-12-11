
YOUSSEF BOUZGARROU
AGYAD
ADAM RAMAHI
NADIM	BOUZGARROU.Y@AC.UNIC.CY

 

WTG-NICOSIA 
APP




 
 

EXECUTIVE SUMMARY
	WTG is a mobile application designed to help international university students in Nicosia discover popular nightlife spots, bars, cafes, clubs, and events. The app displays real-time voting on how many people plan to go to a particular location (“Yes voters”), gives event details, photos, opening hours, and brief descriptions of each place. Its goal  is to make socialising easier, reduce uncertainty, and help students find the “right vibe,” making every outing more enjoyable.

 
PROBLEM STATEMENT
	International students often struggle with:
•	Lack of local knowledge about good places to go.
•	Fear of ending up at empty or boring locations.
•	Difficulty making social plans and knowing where most people are going.
•	Not knowing which places have events, student nights, promotions, or safe environments.
•	More then 15 000 students are entering nicosia per year
MARKETING ANALYSIS
	PRIMARY TARGET MARKET:
•	international university students (ages 18–28) studying in universities in Nicosia:
•	University of Nicosia
•	Cyprus International University
•	Near East University
•	European University Cyprus
•	Frederick University
•	Erasmus participants
SECONDARY TARGET AUDIENCE:
•	Tourists visiting Nicosia
•	Young working adults (26–34)
•	Event organizers & promoters
•	Nightclubs, bars, pubs, lounges
VALUE PROPOSITION
WTG Nicosia makes going out effortless by showing real-time nightlife trends, offering interactive maps, and enabling instant event bookings, all in one platform.


MAIN BENEFIT
USP(UNIQUE SELLING POINT):
•	Targeted: Focuses on students.
•	Differentiated: Combines discovery + social voting, not just listings.
•	Benefit-driven: Saves time, helps plan nights with friends.
•	Simple & catchy: “Find your vibe” is memorable and relatable.
•	Real time data: The app provides real time data of the event
•	From manual lists to smart check-ins: WTG Nicosia gives venues instant access to a database of students attending, streamlining entry and enhancing the nightlife experience.
BRAND
MISSION STATEMENT:
To provide international students in Nicosia with a real-time, reliable, and engaging platform to discover nightlife spots, events, and social gatherings effortlessly.


VISION STATEMENT
To become the leading social nightlife discovery platform for students across Cyprus and, eventually, Europe, enabling young people to connect, explore, and enjoy their social lives confidently.  


BRAND VALUES
•	Community
We exist to bring students together, helping them meet people, socialize, and feel part of a shared student culture. 
•	Fun
WTG celebrates nightlife, experiences, and positive vibes. We help students enjoy their nights, not just plan them. 
•	Confidence
Students should know exactly where to go, what’s happening, and what the vibe is—without uncertainty or guessing. 
•	Inclusivity
Our platform welcomes international students from all backgrounds and nationalities, creating a diverse and open social space.

VISUAL IDENTITY

Logo:
 

Color palette: 
 
Typography:
We use Poppins for headings to create bold visual identity and Inter for body text to ensure clarity and readability across mobile screens.

Brand slogan:
Find the vibe tonight



PRODUCT OVERVIEW + KEY FEATURE
CORE FUNCTIONALITIES





	Functionality	What the User Sees/Does	What the Code / Backend Must Do
	User Registration & Login
	Sign up / log in with email, phone, or social (Google, Apple).	Create user accounts, authentication, store profiles, manage sessions & security.
	Venue & Event Browsing
	List of clubs, bars, cafés, and events.	Fetch venues/events from DB, sort by time, popularity, or distance.
	Real-Time “Yes Voters” Count
	Shows how many people said “Yes, I’m going” in real time.	Store RSVP per event, update counts instantly, prevent duplicate votes.
	“Yes / Maybe / No” RSVP
	User taps Yes/Maybe/No.	Store individual RSVP, allow change of mind, update stats live.
	Vibe Indicator
	Shows vibe (crowded, chill, music type, etc.).	Calculate vibe based on RSVPs, tags, attendance, ratings.
	Event Details Screen
	Photos, info, opening hours, music type, dress code, etc.	Store event data, retrieve on click, support media.
	Real-Time Updates
	Events update without refreshing (Yes counts, edits, deals).	Use real-time listeners (WebSockets/Firebase) to push instant updates.
	Group Chat for “Yes” Users
	People who click Yes join the event chat.	Create chat room per event, auto-join Yes users, real-time messaging.
	Push Notifications
	Reminders, chat messages, updates, deals.	Integrate push service, schedule reminders, trigger notifications.
	“Book Now” Button
	Book a table/entry instantly inside the app.	Create bookings, send data to club panel automatically.
	Club Auto-Database
	Venue gets automatic guest list (no manual typing).	Backend club dashboard, export list, view RSVPs & bookings.
	Deals & Discounts
	Venue-specific offers visible on their profile.	Store deals per venue, show valid ones, auto-expire.
	Map View & Navigation	Map showing clubs/bars + “open in Maps”.	Integrate map SDK, plot markers, deep-link to navigation.
	Search 	Search by place, music type, vibe, price.	Search queries + filters + tags, combine with live data.
	User Profile & Preferences
	Profile: fav music, budgets, visited places.	Store preferences/history; personalize recommendations.
	Favorites	Save venues/events to revisit later.	Save favorites per user; show “My Favorites”.
	Reporting & Safety
	Report events/chats if unsafe/misleading.	Store reports, moderation tools, block users/content.
	Admin/Back-Office Panel	Manage venues, events, deals, analytics.	CRUD for all data, export reports, review safety issues.

USER FLOW
 


WTG-STRUCTURE STRUCTURE
	Picture of our team:

 	 	
ADAM RAMAHI
Marketing chief
CEO	YOUSSEF BOUZGARROU
Founder	

TECHNOLOGY STACK

FRONT END
•	Framework: React Native
•	Platform: iOS & Android
•	UI design: Custom internal component library
•	Styling: Dark theme with brand color palette



BACK END

•	Backend‑as‑a‑Service: Supabase
•	Database: PostgreSQL (hosted on Supabase) for users, venues, events, RSVPs, chats, bookings and deals
•	Authentication & security: Supabase Auth (email / password and social login) with JWT and row‑level security rules
•	Real‑time features: Supabase Realtime channels for live “yes” counts, group chats and instant event updates
•	File storage: Supabase Storage for venue and event images and other media
•	API layer: REST/JSON endpoints consumed by the mobile app, abstracting business logic (RSVPs, bookings, notifications, etc.)


API’S INTEGRATION
•	Supabase APIs: Auth, Database, Realtime, Storage
•	Maps & location: Google Maps / Apple Maps SDK for map view, distance and navigation
•	Push notifications: Expo Notifications (using Firebase Cloud Messaging under the hood) for event reminders and chat updates
•	Email / verification (optional): service such as SendGrid or Twilio for account emails and confirmations

UI MOCKUP
 
 
 
                



                      






 
 



MAIN COMPETITORS

Competitors	What they do	Strengths	Weaknesses (Opportunity for WTG)
Eventbrite	Global event listing & ticketing	Large brand, ticketing, wide categories	Not focused on nightlife or students, not real‑time, no social functions
Fever	Curated events & paid experiences	Strong experience curation, professional	Limited everyday nightlife, not student‑specific, less Cyprus local focus
Ticket
Hour / Ticketing Platforms	Ticketing for big events, concerts, festivals	Strong ticketing & payments	Doesn’t target bars, clubs, student nights, no social features
Cyprus
Alive	Events, sightseeing, culture listings	Local Cyprus knowledge	Old‑style website, not mobile app, no real-time “who’s going”, not student oriented


WTG COMPETITIVE ADVANTAGES
•	Focused specifically on nightlife for students
•	Real‑time “who’s going” social information
•	Group chats built into events
•	Automated reservations & guest lists
•	Student deals and bar promotions
•	Mobile‑first experience

FINANCE
B2C STRATEGY (BUSINESS‑TO‑CONSUMER)
On the student side, WTG operates a freemium B2C model, providing essential features such as event discovery, map view, and “who’s going” completely free. Additional value is created through exclusive offers, premium experiences, and personalised access to nightlife promotions.

B2B STRATEGY (BUSINESS‑TO‑BUSINESS)
WTG applies a value‑based B2B model where revenue is generated from nightlife venues that benefit directly from operational solutions such as automated reservations, guest‑list management, and promotional visibility. Instead of paying only for advertising, venues pay for services that reduce manual work, increase attendance, and improve operational efficiency.

Revenue Stream	How WTG Earns	Suggested Price
Sponsored Listings	Venues pay to appear higher in search + “Tonight’s Top Spots”	€150 – €300 per event promotion
Event Promotions	Push notifications, featured banners, highlighted events	€200 – €500 per promoted event
Student Deals Advertising	Promote “Student Night, 2‑for‑1 drinks, Ladies' Night”	€100 – €250 per deal
Data Insights	Foot traffic, peak hours, behavior analytics	€200 – €400 per month
Reservations Commission	Per booking commission	€1 – €2 per reservation, or 3–5% of booking value
Reservation & Guest‑List Management (NEW)	Full booking & guest‑list automation	€150 – €350 per month per venue

FINANCIAL PROJECTIONS
ASSUMPTIONS
10 venues active
each paying approx €250/month average plan
occasional promotions
low reservation volume (early stage)

	

Projected revenue growth over the next 3 years:


YEAR 1:

$30 000		
YEAR 2:

$250 000		
YEAR 3:

$250 000

DRAFT (NOT REALISTIC)
FUNDING WILL BE USED FOR:

$200,000	Development of proprietary consulting tools
$150,000	Talent acquisition and training
$100,000	Brand development and marketing
$50,000	Operational expansion and client support systems

RISK ASSESSMENT
	Potential challenges and mitigation strategies:
•	Regulatory changes: maintain agile frameworks and ongoing legal partnerships.
•	Market saturation: focus on niche fintech segments and emphasize value-driven results.
•	Talent acquisition: build strong onboarding and internal training programs to scale expertise.
 
EXIT STRATEGY
	Long-term goals include:
•	Expanding nationally through satellite offices and remote teams.
•	Exploring acquisition opportunities with global advisory firms or fintech platforms.
•	Pursuing strategic investment or merger to scale internationally.

MILESTONES & ROADMAP


Q1 20XX:

Launch proprietary risk
assessment toolkit















 

