export default class forms {
  publishForm = async (form_id: string, status: boolean) => {
    const response = await fetch(`https://form-x-eight.vercel.app/api/form`, {
      method: "PUT",
      body: JSON.stringify({
        form_id: form_id,
        status: status
      }),
    });
    const data = await response.json();
    return data;
  };
}
