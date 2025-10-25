import { database } from "../../lib/firebaseconfig";
import { ref, get, update } from "firebase/database";

export const getData = async () => {
  try {
    const headerRef = ref(database, "form"); // Get ref of 'data'
    const snapshot = await get(headerRef); // Get data of 'data'
    return snapshot.val();
  } catch (error) {
    console.error("Error getting data:", error);
    throw error;
  }
};

export const setdata = async (data: string, state: string, user: any) => {
  console.log(user, state);
  try {
    const countRef = ref(database, `form/${data}`);
    const snapshot = await get(countRef);
    let currentUsers: any = [];
    if (snapshot?.val()?.users && snapshot?.val()?.users?.length > 0) {
      currentUsers = [...snapshot?.val()?.users];
    }
    if (state == "on") {
      // if (!currentUsers?.includes(user)) {
      currentUsers?.push(user);
      // }
    } else {
      console.log(currentUsers);
      const index = currentUsers?.indexOf(user);
      if (index !== -1) {
        if (currentUsers?.length == 1) {
          currentUsers = [];
        } else {
          currentUsers = currentUsers.filter((users: string) => users != user);
          if (currentUsers?.length == 0) {
            currentUsers = [];
          }
        }
      }
    }

    await update(countRef, { users: currentUsers });
    console.log("Count decremented successfully");
  } catch (error) {
    console.error("Error decrementing count:", error);
  }
};
