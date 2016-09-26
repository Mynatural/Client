
export type Lineup = {
    name: string,
    price: number,
    specs: Spec[],
    measurements: Measurement[]
}

export type Spec = {
    name: string,
    key: string,
    sides: SpecSide[],
    canSame?: SpecSide,
    value: {
        initial: string,
        availables: SpecValue[]
    }
}

export type SpecSide = "FRONT" | "BACK";

export type SpecValue = {
    name: string,
    key: string,
    price: number
}

export type Measurement = {
    name: string,
    illustration: string, // Filename of SVG
    value: {
        initial: number,
        min: number,
        max: number
    }
}
