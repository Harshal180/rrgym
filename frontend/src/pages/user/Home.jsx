import ContentWithLeftImage from "../../components/shared/ContentWithLeftImage";
import ContentWithRightImage from "../../components/shared/ContentWithRightImage";
import HeadingSubheading from "../../components/shared/HeadingSubheading";
import Hero from "../../components/shared/Hero";
import QuoteCarousel from "../../components/shared/QuoteCarousel";
import Trainer from "../../components/shared/Trainer";

function Home() {
    return (
        <>
            <Hero />

            <ContentWithRightImage
                heading="Committed to Strength & Wellness"
                description="At RR POWER AND WELLNESS GYM, we focus on building strong, healthy, and confident individuals through scientific and sustainable fitness training. Our goal is not just physical transformation, but long-term health, strength, mobility, and discipline.

With expert coaching, modern equipment, and structured programs, we help members train safely, progress consistently, and achieve real results. We promote functional fitness, injury prevention, balanced lifestyle habits, and a supportive community culture"
                imageSrc="/assets/RR1 - Copy - Copy.jpeg"
                imageAlt="Wellness"
            />

            <ContentWithLeftImage
                heading="The RR Fitness services-"
                description={
                    <ul>
                        <li>✅ Modern, well-maintained equipment</li>
                        <li>✅ Spacious workout area</li>
                        <li>✅ Motivating & positive atmosphere</li>
                        <li>✅ Reasonable pricing</li>
                        <li>✅ Friendly, knowledgeable trainers</li>
                        <li>✅ Supplements availability</li>
                    </ul>
                }
                imageSrc="/assets/fitness_image.png"
                imageAlt="Wellness"
            />

            <HeadingSubheading heading={"Advance Fitness Trainers"} />
            <Trainer />
            <QuoteCarousel />
        </>
    );
}

export default Home;
