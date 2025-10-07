class DevelopmentalScreeningBot:
    def __init__(self):
        self.questions = {
            # Behavioral (Autism Spectrum)
            "eye_contact": {"question": "During a conversation, does your child naturally make and hold eye contact without you reminding them?", "domain": "Behavioral", "weight": -1},
            "literal_understanding": {"question": "Does your child take things very literally and have trouble understanding jokes, sarcasm, or phrases like 'break a leg'?", "domain": "Behavioral", "weight": 1},
            "repetitive_behaviors": {"question": "When excited or upset, does your child repeat body movements like flapping their hands, rocking, or spinning?", "domain": "Behavioral", "weight": 1},
            "intense_interests": {"question": "Does your child become extremely focused on one specific topic (e.g., dinosaurs, trains, a specific video game) and talk about it constantly?", "domain": "Behavioral", "weight": 1},
            "change_upset": {"question": "Does your child get very upset by small changes, like a different brand of cereal or taking a new route to school?", "domain": "Behavioral", "weight": 1},
            "social_difficulty": {"question": "Does your child struggle to make friends their own age and prefer to play alone or interact much more with adults?", "domain": "Behavioral", "weight": 1},

            # Cognitive/Attention (ADHD)
            "seated_difficulty": {"question": "Does your child have great difficulty remaining seated during meals, homework, or in classroom settings?", "domain": "Cognitive/Attention", "weight": 1},
            "forgetful": {"question": "Is your child unusually forgetful in daily activities, often losing track of toys, homework, jackets, or water bottles?", "domain": "Cognitive/Attention", "weight": 1},
            "sidetracked": {"question": "Is your child easily sidetracked by background noises or things they see out the window, making it hard to finish tasks?", "domain": "Cognitive/Attention", "weight": 1},
            "blurting": {"question": "Does your child frequently blurt out answers before questions are finished or have trouble waiting for their turn in games?", "domain": "Cognitive/Attention", "weight": 1},
            "task_avoidance": {"question": "Does your child avoid or strongly dislike tasks that require sustained mental effort, like homework or lengthy puzzles?", "domain": "Cognitive/Attention", "weight": 1},
            "constant_motion": {"question": "Would you describe your child as constantly 'on the go,' as if driven by a motor, often running or climbing in inappropriate situations?", "domain": "Cognitive/Attention", "weight": 1},

            # Motor Skills (Cerebral Palsy / Dyspraxia)
            "clumsy": {"question": "Compared to other children the same age, does your child seem unusually clumsy, frequently tripping or bumping into things?", "domain": "Motor Skills", "weight": 1},
            "fine_motor_tasks": {"question": "Does your child struggle with fine motor tasks like buttoning a shirt, using a fork and spoon correctly, or writing neatly?", "domain": "Motor Skills", "weight": 1},
            "muscle_tone": {"question": "When you pick your child up, do their muscles feel unusually stiff and rigid, or unusually floppy and loose?", "domain": "Motor Skills", "weight": 1},
            "hand_preference": {"question": "Before the age of 4, does your child strongly prefer using one hand for all tasks like drawing and eating?", "domain": "Motor Skills", "weight": 1},
            "coordination_issues": {"question": "Does your child have trouble with coordinated movements like jumping with both feet, skipping, or catching a ball with two hands?", "domain": "Motor Skills", "weight": 1},
            "crawling_abnormal": {"question": "Did your child have an unusual way of crawling (e.g., using one leg, scooting on their bottom) or skip crawling altogether?", "domain": "Motor Skills", "weight": 1},

            # Language/Academic (Dyslexia / Language Disorder)
            "letter_mixing": {"question": "Does your child consistently mix up letters that look similar (like 'b' and 'd') or numbers (like '6' and '9')?", "domain": "Language/Academic", "weight": 1},
            "phonics_struggle": {"question": "When reading, does your child struggle to 'sound out' a new word, even after being shown the phonics rules multiple times?", "domain": "Language/Academic", "weight": 1},
            "reading_avoidance": {"question": "Does your child read slowly, guess words based on the first letter, or avoid reading for fun because it is so difficult?", "domain": "Language/Academic", "weight": 1},
            "multi_step_instructions": {"question": "Does your child have trouble remembering and following multi-step instructions, like 'Please go upstairs, get your shoes, and put them by the door'?", "domain": "Language/Academic", "weight": 1},
            "word_finding": {"question": "Does your child frequently mispronounce long words (e.g., saying 'aminal' for 'animal') or have trouble finding the right word when speaking?", "domain": "Language/Academic", "weight": 1},
            "verbal_writing_gap": {"question": "Is there a major difference between your child's verbal skills and their writing? (e.g., They can tell a great story but can't write it down).", "domain": "Language/Academic", "weight": 1},
        }

    def calculate_domain_scores(self, responses):
        """Calculate scores for each developmental domain."""
        domain_scores = {
            "Behavioral": 0,
            "Cognitive/Attention": 0,
            "Motor Skills": 0,
            "Language/Academic": 0
        }

        for question_key, response in responses.items():
            if question_key not in self.questions or not response:
                continue

            try:
                response_value = int(response)
            except (ValueError, TypeError):
                continue

            question_spec = self.questions[question_key]
            domain = question_spec["domain"]
            weight = question_spec["weight"]

            # Handle reverse scoring for questions like eye contact
            if weight < 0:
                # For negative weight: "Never" (1) becomes 4, "Always" (4) becomes 1
                points = (5 - response_value) * abs(weight)
            else:
                points = response_value * weight

            domain_scores[domain] += points

        return domain_scores

    def generate_assessment(self, domain_scores, child_age):
        """Generate assessment results based on domain scores."""
        # Risk thresholds (conceptual - not clinically validated)
        risk_thresholds = {
            "Behavioral": 14,
            "Cognitive/Attention": 16,
            "Motor Skills": 14,
            "Language/Academic": 16
        }

        flagged_domains = []
        high_risk_count = 0

        for domain, score in domain_scores.items():
            threshold = risk_thresholds.get(domain, 0)
            if score >= threshold:
                flagged_domains.append(domain)
                high_risk_count += 1

        # Determine overall risk level
        if high_risk_count == 0:
            overall_risk = "Low"
            message = "Your responses suggest typical developmental patterns."
            detailed_message = "Based on your screening responses, your child appears to be developing within typical ranges across all assessed areas. Continue monitoring their development and providing supportive learning opportunities."
            recommendations = [
                "Continue regular well-child check-ups",
                "Provide age-appropriate learning opportunities",
                "Monitor developmental milestones",
                "Consult your pediatrician if you have any concerns"
            ]

            return {
                "overall_risk": overall_risk,
                "domain_scores": domain_scores,
                "flagged_domains": flagged_domains,
                "message": message,
                "detailed_message": detailed_message,
                "recommendations": recommendations
            }
        elif high_risk_count == 1:
            overall_risk = "Moderate"
            flagged_domain = flagged_domains[0]
            message = f"Potential concerns identified in the {flagged_domain} domain."
            detailed_message = f"Your screening indicates some areas that may benefit from further evaluation. This does not necessarily indicate a developmental disorder, but early intervention can be very helpful."

            # Add specific informative content for the flagged domain
            domain_info = ""
            if flagged_domain == "Behavioral":
                domain_info = "\n\n**Informative Content: Behavioral Domain**\nChallenges in social communication and interaction, alongside restricted and repetitive behaviors, are core features of Autism Spectrum Disorder (ASD). These are not simply preferences but represent neurological differences in how the brain processes social information and environmental stimuli. An elevated score here suggests a child may find social situations confusing or overwhelming and may rely on routines and repetitive behaviors to create predictability. Early intervention, such as speech and occupational therapy, can be profoundly beneficial."
            elif flagged_domain == "Cognitive/Attention":
                domain_info = "\n\n**Informative Content: Cognitive/Attention Domain**\nADHD is a neurodevelopmental disorder of executive function—the cognitive skills that help us plan, focus, and execute tasks. A child with ADHD isn't simply 'being difficult'; their brain is managing a constant stream of stimuli and impulses differently. An elevated score may indicate challenges with self-regulation, working memory, and cognitive flexibility. Strategies like behavioral therapy, environmental modifications, and professional guidance can be effective parts of a management plan."
            elif flagged_domain == "Motor Skills":
                domain_info = "\n\n**Informative Content: Motor Skills Domain**\nMotor challenges can stem from differences in muscle tone, coordination (dyspraxia), or neurological conditions. These are not due to a lack of practice but to differences in how the brain sends messages to the muscles. An elevated score suggests a child may struggle with the physical coordination required for everyday tasks and playground activities. An evaluation by an occupational or physical therapist is essential to identify the root cause and develop a targeted therapy plan."
            elif flagged_domain == "Language/Academic":
                domain_info = "\n\n**Informative Content: Language/Academic Domain**\nDifficulties here often point to a Specific Learning Disorder like Dyslexia (reading) or a Language Disorder. Dyslexia is not a problem with intelligence; it is a difficulty with phonological processing—the ability to identify and manipulate the sounds in language. This makes connecting letters to their sounds challenging. An elevated score suggests a child may be struggling to crack the linguistic code. A formal psychoeducational assessment is key to identifying the specific profile and securing effective interventions and accommodations."

            detailed_message += domain_info

            recommendations = [
                "Discuss results with your child's pediatrician",
                "Consider developmental screening with a specialist",
                f"Monitor the {flagged_domain.lower()} area closely",
                "Seek early intervention services if available in your area"
            ]

            return {
                "overall_risk": overall_risk,
                "domain_scores": domain_scores,
                "flagged_domains": flagged_domains,
                "message": message,
                "detailed_message": detailed_message,
                "recommendations": recommendations
            }
        else:
            overall_risk = "High"
            message = f"Potential concerns identified in {high_risk_count} developmental domains."
            detailed_message = "Your screening suggests multiple areas that may warrant professional evaluation. While this tool is not diagnostic, these results indicate that consultation with developmental specialists would be beneficial."
            recommendations = [
                "Schedule comprehensive developmental evaluation",
                "Consult with pediatrician and developmental specialists",
                "Consider speech therapy, occupational therapy, or behavioral interventions",
                "Contact early intervention services or school district for support"
            ]

            return {
            "overall_risk": overall_risk,
            "domain_scores": domain_scores,
            "flagged_domains": flagged_domains,
            "message": message,
            "detailed_message": detailed_message,
            "recommendations": recommendations
        }

    # Legacy method for backward compatibility
    def calculate_score(self, responses):
        """Legacy method that returns total score across all domains."""
        domain_scores = self.calculate_domain_scores(responses)
        return sum(domain_scores.values())

# Example usage for testing
if __name__ == "__main__":
    bot = DevelopmentalScreeningBot()
    
    # Test responses (using 1-4 scale)
    test_responses = {
        "eye_contact": "1",  # Never/Rarely (reverse scored - high risk)
        "seated_difficulty": "4",  # Always (high risk)
        "clumsy": "2",  # Sometimes (moderate risk)
        "phonics_struggle": "3",  # Often (high risk)
    }

    domain_scores = bot.calculate_domain_scores(test_responses)
    assessment = bot.generate_assessment(domain_scores, 5)

    print(f"Domain Scores: {domain_scores}")
    print(f"Overall Risk: {assessment['overall_risk']}")
    print(f"Flagged Domains: {assessment['flagged_domains']}")
    print(f"Message: {assessment['message']}")
