import { login } from "../../hoc/withAuth";
import cookie from "js-cookie";
import { getToken } from "../../../server/auth";
const COOKIE_NAME = "comics_token";

export default async (req, res) => {
    const code = req.query.code;
    const app = await getToken(code);
    return res.cookie(COOKIE_NAME, app.access_token).redirect("/");
}
