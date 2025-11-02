export type PollutantInfo = {
    code: string;
    displayName: string;
    fullName: string;
    units: string;
    description: string;
    sources: string;
    healthEffects: string;
};

export const pollutantDetails: Record<string, PollutantInfo> = {
    pm25: {
        code: "pm25",
        displayName: "PM2.5",
        fullName: "Fine Particulate Matter (<2.5µm)",
        units: "µg/m³",
        description:
            "PM2.5 refers to fine inhalable particles with diameters that are generally 2.5 micrometers and smaller. They can penetrate deep into the lungs and even enter the bloodstream.",
        sources:
            "Vehicle exhaust, industrial emissions, residential wood burning, and open fires.",
        healthEffects:
            "Long-term exposure can cause asthma, heart disease, stroke, and lung cancer. Short-term exposure may cause coughing, irritation, and difficulty breathing.",
    },
    pm10: {
        code: "pm10",
        displayName: "PM10",
        fullName: "Inhalable Particulate Matter (<10µm)",
        units: "µg/m³",
        description:
            "PM10 are inhalable particles with diameters of 10 micrometers and smaller. These are larger than PM2.5 but still pose health risks.",
        sources:
            "Road dust, construction sites, agricultural activities, and industrial processes.",
        healthEffects:
            "Can irritate the eyes, nose, and throat, and worsen conditions like asthma and bronchitis.",
    },
    o3: {
        code: "o3",
        displayName: "O₃",
        fullName: "Ozone",
        units: "ppb",
        description:
            "Ozone at ground level is formed when sunlight reacts with pollutants such as nitrogen oxides (NOx) and volatile organic compounds (VOCs).",
        sources:
            "Formed from vehicle emissions, fuel vapors, and chemical solvents reacting in sunlight.",
        healthEffects:
            "Exposure can cause chest pain, coughing, throat irritation, and worsen respiratory diseases like asthma.",
    },
    co: {
        code: "co",
        displayName: "CO",
        fullName: "Carbon Monoxide",
        units: "ppb",
        description:
            "Carbon monoxide is a colorless, odorless gas produced by incomplete combustion of carbon-containing fuels.",
        sources:
            "Motor vehicles, generators, and burning of wood, coal, or other fuels.",
        healthEffects:
            "Reduces oxygen delivery to the body’s organs and tissues; high exposure can be fatal. Low-level exposure can cause dizziness and headaches.",
    },
    no2: {
        code: "no2",
        displayName: "NO₂",
        fullName: "Nitrogen Dioxide",
        units: "ppb",
        description:
            "Nitrogen dioxide is a reddish-brown gas that forms from combustion processes, especially in vehicles and power plants.",
        sources:
            "Car and truck exhaust, industrial facilities, and off-road equipment.",
        healthEffects:
            "Can irritate airways and increase susceptibility to respiratory infections and asthma attacks.",
    },
    so2: {
        code: "so2",
        displayName: "SO₂",
        fullName: "Sulfur Dioxide",
        units: "ppb",
        description:
            "Sulfur dioxide is a gas produced by the burning of fossil fuels that contain sulfur, such as coal and oil.",
        sources: "Coal-burning power plants, metal smelting, and volcanoes.",
        healthEffects:
            "Short-term exposure can cause throat and eye irritation, coughing, and difficulty breathing, especially for people with asthma.",
    },
};
