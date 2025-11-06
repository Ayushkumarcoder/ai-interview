import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { createPendingInterviewForUser } from "@/lib/actions/general.action";

const Page = async () => {
  const user = await getCurrentUser();
  const { success, interviewId } = await createPendingInterviewForUser();

  return (
    <>
      <h3>Interview generation</h3>

      <Agent
        userName={user?.name!}
        userId={user?.id}
        profileImage={user?.profileURL}
        type="generate"
        interviewId={success ? interviewId : undefined}
      />
    </>
  );
};

export default Page;
