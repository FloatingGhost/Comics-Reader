import { authenticate } from "../../../server/auth";

export default async (req, res) => {
    return await authenticate(req, res);
};
