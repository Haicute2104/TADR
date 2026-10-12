# -*- coding: utf-8 -*-
import json
import os

items = []


def add(category, prompt, answers):
    items.append(
        {
            "id": f"{category}-{len(items)+1}",
            "category": category,
            "prompt": prompt.strip(),
            "answers": answers,
        }
    )


# Past simple -> present perfect
add("past-perfect", "My uncle last painted his house last year.", ["My uncle hasn't painted his house since last year.", "My uncle has not painted his house since last year."])
add("past-perfect", "They last visited me 5 years ago.", ["They haven't visited me for 5 years.", "They have not visited me for 5 years."])
add("past-perfect", "Mary last took some pictures when she was on holiday last year.", ["Mary hasn't taken any pictures since she was on holiday last year."])
add("past-perfect", "My children last ate ice cream last summer.", ["My children haven't eaten ice-cream since last summer.", "My children haven't eaten ice cream since last summer."])
add("past-perfect", "The last time my sister bought some clothes was 9 months ago.", ["My sister hasn't bought any clothes for 9 months."])
add("past-perfect", "He last wrote to his parents 6 months ago.", ["He hasn't written to his parents for 6 months."])
add("past-perfect", "They last had a holiday abroad in 2019.", ["They haven't had a holiday abroad since 2019."])
add("past-perfect", "Janet started playing the piano when she was in grade 5.", ["Janet has played the piano since she was in grade 5."])
add("past-perfect", "These workers began working in that factory in 2001.", ["These workers have worked in that factory since 2001.", "These workers have been working in that factory since 2001."])
add("past-perfect", "My friends began studying English 15 years ago.", ["My friends have studied English for 15 years.", "My friends have been studying English for 15 years."])

# Comparison
add("comparison", "No student in the class is as smart as Bill.", ["Bill is the smartest student in the class."])
add("comparison", "The countryside is more peaceful than the city.", ["The city isn't as peaceful as the countryside.", "The city is not as peaceful as the countryside."])
add("comparison", "The seats at the front are more expensive than the seats at the back.", ["The seats at the back aren't as expensive as the seats at the front.", "The seats at the back are not as expensive as the seats at the front."])
add("comparison", "No city in Britain is as exciting as Liverpool.", ["Liverpool is the most exciting city in Britain."])
add("comparison", "Speaking Japanese is easier than writing Japanese.", ["Writing Japanese isn't as easy as speaking Japanese.", "Writing Japanese is not as easy as speaking Japanese."])
add("comparison", "Travelling by plane is more comfortable than by train.", ["Travelling by train isn't as comfortable as by plane.", "Traveling by train isn't as comfortable as by plane.", "Travelling by train is not as comfortable as by plane."])
add("comparison", "The countryside is not as noisy as the city.", ["The city is nosier than the countryside.", "The city is noisier than the countryside."])
add("comparison", "Many people say that no city in the world is as romantic as Venice.", ["Many people say that Venice is the most romantic city in the world."])
add("comparison", "No place on the Earth is as cold as Antarctica.", ["Antarctica is the coldest place on the Earth.", "Antarctica is the coldest place on Earth."])
add("comparison", "Central Park in New York is bigger than Hyde Park in London.", ["Hyde Park in London isn't as big as Central Park in New York.", "Hyde Park in London is not as big as Central Park in New York."])

# Relative
add("relative", "He worked for a woman. She used to be an artist.", ["He worked for a woman who used to be an artist."])
add("relative", "They called a doctor. He lived nearby.", ["They called a doctor who lived nearby."])
add("relative", "I wrote an email to my sister. She lives in Italy.", ["I wrote an email to my sister who lives in Italy."])
add("relative", "The police officer has just arrested a man. He robbed the bank.", ["The police officer has just arrested a man who robbed the bank."])
add("relative", "We broke a car. It belonged to my uncle.", ["We broke a car which belonged to my uncle.", "We broke a car that belonged to my uncle."])
add("relative", "Nam loves books. They have happy endings.", ["Nam loves books which have happy endings.", "Nam loves books that have happy endings."])
add("relative", "I first learned English from a book. I've just reread it.", ["I first learned English from a book which I've just reread.", "I first learned English from a book which I have just reread.", "I first learned English from a book that I've just reread."])
add("relative", "She opened the cupboard. She kept her best glasses in there.", ["She opened the cupboard where she kept her best glasses."])
add("relative", "This is a very old house. General Giap lived here.", ["This is a very old house where General Giap lived."])
add("relative", "There's a great new bookshop in town. You can buy all the latest magazines there.", ["There's a great new bookshop in town where you can buy all the latest magazines.", "There is a great new bookshop in town where you can buy all the latest magazines."])

# First conditional
add("cond1", "I'll be very disappointed unless he passes his exam.", ["If he doesn't pass his exam, I'll be disappointed.", "If he does not pass his exam, I will be disappointed."])
add("cond1", "They won't let her into the concert if she doesn't have a ticket.", ["Unless she has a ticket, they won't let her into the concert."])
add("cond1", "If she doesn't water these plants, they will die.", ["Unless she waters these plants, they will die."])
add("cond1", "I won't be able to do any work if I don't have a quiet room.", ["Unless I have a quiet room, I won't be able to do any work."])
add("cond1", "If you don't stop smoking, you will be seriously ill.", ["Unless you stop smoking, you will be seriously ill."])
add("cond1", "She won't agree to that unless you accept her suggestion.", ["If you accept her suggestion, she will agree to that."])
add("cond1", "If she doesn't pay up, we're going to be in real trouble.", ["Unless she pays up, we're going to be in real trouble.", "Unless she pays up, we are going to be in real trouble."])
add("cond1", "If it doesn't rain this August, there will be water shortages.", ["Unless it rains this August, there will be water shortages."])
add("cond1", "Unless it stops raining, we will not have a picnic.", ["If it doesn't stop raining, we will not have a picnic.", "If it does not stop raining, we will not have a picnic."])
add("cond1", "Unless you start now, you will not reach there in time.", ["If you don't start now, you will not reach there in time."])

# Second conditional
add("cond2", "I can't take you to the airport because I don't have a car.", ["If I had a car, I could take you to the airport."])
add("cond2", "I have a headache. I can't go swimming.", ["If I didn't have a headache, I could go swimming.", "If I did not have a headache, I could go swimming."])
add("cond2", "We don't take a holiday this year because we haven't got any money.", ["If we had some money, we would take a holiday this year.", "If we had any money, we would take a holiday this year."])
add("cond2", "We don't live in a big house. We can't invite friends to stay.", ["If we lived in a big house, we could invite friends to stay."])
add("cond2", "Kevin doesn't get good grades because he doesn't study much.", ["If Kevin studied much, he would get good grades.", "If Kevin studied more, he would get good grades."])
add("cond2", "Francis works very hard. He doesn't have time to spend with his family.", ["If Francis didn't work very hard, he would have time to spend with his family."])
add("cond2", "Andrea doesn't pay attention in class. Then she doesn't understand the homework.", ["If Andrea paid attention in class, she would understand the homework."])
add("cond2", "Johnny's mom often gets angry with Johnny because he doesn't pick up his toys.", ["If Johnny picked up his toys, his mom wouldn't get angry with him.", "If Johnny picked up his toys, his mother wouldn't get angry with him."])
add("cond2", "Ben drives too fast so he gets a lot of speeding tickets.", ["If Ben didn't drive too fast, he wouldn't get a lot of speeding tickets."])
add("cond2", "Andrew coughs a lot because he smokes.", ["If Andrew didn't smoke, he wouldn't cough a lot."])

# Reported speech
add("reported", 'Jane said, "I want to study medicine, father."', ["Jane said to her father that she wanted to study medicine.", "Jane told her father that she wanted to study medicine.", "Jane said to her father that she wanted to study medicine"])
add("reported", '"I studied music for five years." Alex said.', ["Alex said he had studied music for five years.", "Alex said that he had studied music for five years."])
add("reported", '"I\'ve been to Shanghai." She said.', ["She said she had been to Shanghai.", "She said that she had been to Shanghai."])
add("reported", '"We can help you." John said.', ["John said they could help me.", "John said that they could help me."])
add("reported", 'He said to me, "I saw your friend at the cinema yesterday."', ["He said to me he had seen my friend at the cinema the day before.", "He told me he had seen my friend at the cinema the day before.", "He said to me that he had seen my friend at the cinema the previous day."])
add("reported", 'Mr West said, "I am very tired."', ["Mr West said he was very tired.", "Mr West said that he was very tired."])
add("reported", 'He said, "I am flying to Rome tomorrow."', ["He said he was flying to Rome the next day.", "He said that he was flying to Rome the following day."])
add("reported", 'George said, "I have lived in this village all my life."', ["George said he had lived in that village all his life.", "George said that he had lived in that village all his life."])
add("reported", 'Peter said to me, "I can\'t go out with you because I am not feeling well."', ["Peter said to me he couldn't go out with me because he was not feeling well.", "Peter told me he couldn't go out with me because he wasn't feeling well."])
add("reported", 'Helen said to me, "I hope you have enjoyed yourself."', ["Helen said to me she hoped I had enjoyed myself.", "Helen told me she hoped I had enjoyed myself."])

# Modals
add("modal", "Why was it necessary for you to go to school last Saturday?", ["Why did you have to go to school last Saturday?"])
add("modal", "I don't think it's a good idea for you to spend too much time playing games.", ["You shouldn't spend too much time playing games.", "You should not spend too much time playing games."])
add("modal", "It's necessary for the children to wear a uniform.", ["The children have to wear a uniform.", "The children must wear a uniform."])
add("modal", "I think it would be a good idea to say sorry to your parents.", ["You should say sorry to your parents."])
add("modal", "It is not a good idea for you to drink so much coffee.", ["You shouldn't drink so much coffee.", "You should not drink so much coffee."])
add("modal", "It is not necessary for him to apologize. He was absolutely right.", ["He doesn't have to apologize. He was absolutely right.", "He does not have to apologize. He was absolutely right."])
add("modal", "It is necessary for us to give him our answer today or we'll lose out on the contract.", ["We have to give him our answer today or we'll lose out on the contract.", "We must give him our answer today or we'll lose out on the contract."])
add("modal", "It's a good idea for you to go and lie down.", ["You should go and lie down."])
add("modal", "It's not necessary for you to learn all the new words.", ["You don't have to learn all the new words.", "You do not have to learn all the new words."])
add("modal", "Is it necessary for you to attend every English lesson?", ["Do you have to attend every English lesson?"])
add("modal", "It would be a good idea if Harry took a holiday.", ["Harry should take a holiday."])
add("modal", "It's not a good idea to leave a child unsupervised.", ["Children shouldn't be unsupervised.", "You shouldn't leave a child unsupervised.", "A child shouldn't be unsupervised."])
add("modal", "It is necessary to register in advance to take the course.", ["You have to register in advance to take the course.", "You should register in advance to take the course.", "You must register in advance to take the course."])
add("modal", "It is not necessary to read all those books.", ["You don't have to read all those books."])
add("modal", "I think she needs to spend more time with you.", ["She should spend more time with you."])

# Although / in spite of
add("although", "Although she is beautiful, everybody hates her.", ["In spite of her beauty, everybody hates her.", "Despite her beauty, everybody hates her."])
add("although", "Jane rarely sees Alan although they are neighbors.", ["In spite of being neighbors, Jane rarely sees Alan.", "Despite being neighbors, Jane rarely sees Alan."])
add("although", "Kate did not do well in the exam in spite of working very hard.", ["Although Kate worked very hard, she didn't do well in the exam.", "Although Kate worked very hard, she did not do well in the exam."])
add("although", "Although I was very hungry, I couldn't eat.", ["In spite of being hungry, I couldn't eat.", "Despite being hungry, I couldn't eat.", "In spite of my hunger, I couldn't eat."])
add("although", "In spite of the difficulty, they managed to solve the math problem.", ["Although the math problem was difficult, they managed to solve it.", "Although it was difficult, they managed to solve the math problem."])
add("although", "She decided to go abroad for a year in spite of loving her boyfriend very much.", ["Although she loved her boyfriend very much, she decided to go abroad for a year."])
add("although", "Although it was cold, Marie didn't put on her coat.", ["In spite of being cold, Marie didn't put on her coat.", "In spite of the cold, Marie didn't put on her coat.", "Despite the cold, Marie didn't put on her coat."])
add("although", "Clare did the work in spite of being ill.", ["Although Clare was ill, she did the work."])
add("although", "Although the weather was bad, we enjoyed our trip.", ["In spite of the bad weather, we enjoyed our trip.", "Despite the bad weather, we enjoyed our trip."])
add("although", "The children slept well in spite of the noise.", ["Although there was noise, the children slept well.", "Although it was noisy, the children slept well."])

out = os.path.join(os.path.dirname(__file__), "..", "src", "data", "writingItems.json")
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, "w", encoding="utf-8") as f:
    json.dump(items, f, ensure_ascii=False, indent=2)
print(len(items))
