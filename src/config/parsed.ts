import dotenv from 'dotenv';

const createParsedConfig = () => {
    const { parsed } = dotenv.config({
        path: `${process.cwd()}/${
            process.env.NODE_ENV === 'test' ? '.test' : ''
        }.env`,
    });
    if (!parsed) {
        throw new Error('There is no env file');
    }
    return parsed;
};

export default createParsedConfig;
