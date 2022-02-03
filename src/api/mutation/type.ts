type MutationAccommodation = Readonly<{
    accommodation: {
        key: 'unit' | 'room';
        id: number;
    };
}>;

export default MutationAccommodation;
