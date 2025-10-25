export default class organizationService {
  getUserOrganizations = async (
    user_id: string | null,
    org_id: string | null,
    order: string | null
  ) => {
    const response = await fetch(
      `https://form-x-eight.vercel.app/api/organization?user_id=${user_id}&org_id=${org_id}${
        order ? "&order=order" : ""
      }`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    return data;
  };
}
