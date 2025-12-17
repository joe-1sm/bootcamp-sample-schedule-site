I'm going to type the field name in airtable and then = to tell you the field type and then = to give you shorthand for what it contains and other things I want you to know that will make our lives easier. Assume everything left of the first '=' is the field title in airtable. That we we can note that stuff and refer to it colloquially as we talk. There will be some lines where I don't mention a field but give context I want you to know. I'll start those with three pound signs, '###'. We'll call this our 'Knowledge Repo' for the rest of this chat. Sound good?


###every record in the CC-1 table references either a course meeting (we'll call them lecture sessions) or a course assignment (we'll call them async tasks).
###There are three primary course types: (1) old courses, (2) Comprehensive Courses, and (3) New Bootcamps. We're primarily dealing with new bootcamps here but might come back and work with some comprehensive course stuff later.
###All of this is hosted on Softr which is using airtable as a backend. The user record base is a table called 'Student Roster' where each user for softr corresponds to a 'Student Roster' field. It's possible we may need to show something slightly different for different students in this element at some point.

Assignments & Review= long form text field with rich text enabled = historically this would contain all the information the student needed to know about that particular lecture session or async task; however that was a little disorganized and hard to work with so we're going to split things up in this project so we can be a little more organized and agile. Even in this new situation we're probably still going to use this as a brief overview or announcements or notes for the meeting

Lecture Database Link=linked record field, linked to the Lectures Database table in which each record includes metadata for a type of lecture that can occur. For instance, one record in this field might be 'Fundamentals of Physics' and will include all the assignments and lecture description that should go with the Fundamentals of Physics lecture sessions, of which there will be many in the CC-1 table.

live_or_assignment=lookup field from the 'Lecture Database link' field which is linked to the 'Lectures Database' table, within which the field in question is a single select field that is either 'live_class' which indicates that the record in CC-1 will correspond to a live, synchronous meeting, or it is 'async_assignment' which indicates the record from CC-1 will correspond to an asynchronous assignment

bootcamp_course= linked record field that links to the 'bootcamp_course' table. Each record in that table corresponds to a distinct cohort for the new bootcamp style course. Sometimes there will be multiple cohorts linked to a given lecture session or async task (CC-1 record).

Courses1=linked record field that links to the 'Courses1' table. Each record in that table corresponds to a distinct cohort for the Comprehensive Course style course. Sometimes there will be multiple cohorts linked to a given lecture session or async task (CC-1 record).

uworld_test_id= linked record field that links to the 'UWorld Test IDs' table where each record is a UWorld test ID that can be pasted into the UWorld question bank to deliver UWorld questions. Some lecture sessions  and some async tasks will have these along with them. We may want to pull data from this so you'll need to let me know whether we need to create lookup fields for that to work in softr.

UWorld Question IDs (from uworld_test_id)=lookup field from the 'UWorld Test IDs' table in which it is a linked record field to the 'UWorld Question IDs' table in which each record corresponds to a specific question from UWorld. This means the 'UWorld Question IDs (from uworld_test_id)' field will return data in kind of a weird way but it would be very useful to students if we could create a button or something that they could click which, when clicked, would place in their clipboard a comma separated string of all the UWorld question IDs linked here. For reference, the field we would need to show up is a number field titled 'QID' in the 'UWorld Question IDs' table

aamc_passages=linked record field that goes to the 'aamc_passages' table where each record is a practice question passage from the AAMC

aamc_resource (from aamc_passages)=lookup field from the 'aamc_passages' record in which the field being looked up is a linked record field that links to the 'aamc_resources' table in which each record is a resource from the AAMC

aamc_questions (from aamc_passages)=lookup field from the 'aamc_passages' record in which the field being looked up is a linked record field that links to the 'aamc_questions' table in which each record is a question from the AAMC

1sm_passages=linked record field that goes to the '1sm_passages' table where each record is a practice question passage from 1sm

1sm_questions (from 1sm_passages)=lookup field from the '1sm_passages' record in which the field being looked up is a linked record field that links to the '1sm_questions' table in which each record is a question from 1SM

1sm_resource (from 1sm_passages)=lookup field from the '1sm_passages' record in which the field being looked up is a linked record field that links to the '1sm_resources' table in which each record is a resource from 1SM

Instructor (linked)= linked record field that links to the 'TUTORS' table where each record corresponds to one of the tutors (course instructors). These are the individuals teaching the class. The 'Instructor Nickname' field you listed above is a lookup field linked to this field.

Zoom Link (Tutor Personal Zoom Room) (from Instructor (linked))= lookup field from the TUTORS table also linked via the Instructor (linked) field = each tutor has their own personal Zoom meeting room url and this shows up here when they sign up to teach the meeting.

Zoom link=url record field = link to the Zoom call where the live meeting will be hosted for lecture sessions = this should always be identical to the 'Zoom Link (Tutor Personal Zoom Room) (from Instructor (linked))' and is really there for redundancy. We usually use this one (legacy automations rely on it) but try to link the other one (above) too anything that is student facing in case this ends up empty for some reason (populate with 'if empty then {other one}' functions).

Meeting Video= url field where the youtube video of the meeting will be linked after the meeting ends so students can go back and rewatch later.

Google calendar event ID=contains the ID for a google calendar event that is created in the instructors calendar by the mcat@1sourcemedicine.com admin account when the instructor signs up to teach. This is just in case we want to link to google calendar for any reason.


I should have mentioned this earlier but I also need you to filter OUT CC-1 records that have 'wbc25' in the 'bootcamp_course' field and 'async_assignment' in the 'live_or_assignment' lookup field but do NOT link to the logged in user record in the 'Student Roster' table via the CC-1 linked record field 'student_assignment'. For these records you could also look for the logged in user's email address in the 'Student Email (from student_assignment)' lookup field which is a lookup from the 'student_assignment' linked record field linking to 'Student Roster' which is the Softr user database. There is also a lookup field in CC-1 table called 'idN_student_assignment' which contains a unique number for each student. These are going to be the events that are currently Gray and marked as Assignments and they will be different for each user.
