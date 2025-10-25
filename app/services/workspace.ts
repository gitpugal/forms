export default class workspace {
  getUserWorkspaces = async (org_id: string | null) => {
    const response = await fetch(
      `https://form-x-eight.vercel.app/api/workspace?org_id=${org_id}`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    return data;
  };
}
