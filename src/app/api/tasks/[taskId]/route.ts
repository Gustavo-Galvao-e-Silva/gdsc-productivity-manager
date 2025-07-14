import { adminDb } from "@/firebase/firebaseadmin";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES = ["To Do", "In Progress", "Review", "Done"];

function cleanString(input: unknown, maxLength: number): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/\s+/g, " ").substring(0, maxLength);
}

interface TaskUpdateBody {
  name?: string;
  description?: string;
  assigneesIds?: string[];
  deadline?: string;
  status?: "To Do" | "In Progress" | "Review" | "Done";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
): Promise<NextResponse> {
  try {
    const body: TaskUpdateBody = await req.json();
    const taskId = params.taskId?.trim();

    if (!taskId) {
      return new NextResponse("Missing task ID", { status: 400 });
    }

    const taskRef = adminDb.collection("tasks").doc(taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
      return new NextResponse("Task not found", { status: 404 });
    }

    const updates: Partial<TaskUpdateBody> = {};

    if ("name" in body) {
      const name = cleanString(body.name, 100);
      if (!name) {
        return new NextResponse("Invalid name", { status: 400 });
      }
      updates.name = name;
    }

    if ("description" in body) {
      updates.description = cleanString(body.description, 2000);
    }

    if ("deadline" in body) {
      if (typeof body.deadline !== "string") {
        return new NextResponse("Invalid deadline", { status: 400 });
      }
      const deadline = new Date(body.deadline);
      if (isNaN(deadline.getTime())) {
        return new NextResponse("Invalid deadline", { status: 400 });
      }
      updates.deadline = deadline.toISOString();
    }

    if ("assigneesIds" in body && Array.isArray(body.assigneesIds)) {
      updates.assigneesIds = [
        ...new Set(
          body.assigneesIds
            .filter(
              (id: unknown): id is string =>
                typeof id === "string" && id.trim() !== ""
            )
            .map((id: string) => id.trim())
        ),
      ];
    }

    if ("status" in body) {
      const status = cleanString(body.status, 100) as TaskUpdateBody["status"];
      if (typeof status !== "string" || !VALID_STATUSES.includes(status)) {
        return new NextResponse("Invalid status", { status: 400 });
      }
      updates.status = status;
    }

    await taskRef.update(updates);
    return new NextResponse("Task updated successfully", { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return new NextResponse("Failed to update task", { status: 500 });
  }
}
