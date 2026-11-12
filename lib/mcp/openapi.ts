/**
 * OpenAPI 3.1.0 Specification Generator for Classy Tutor Tools.
 *
 * Used by ChatGPT Custom GPT Actions, Gemini AI Studio Function Calling,
 * and Perplexity Collections to discover and execute tutor actions.
 */

export function generateOpenApiSpec(token: string, appUrl: string) {
  const baseUrl = appUrl.replace(/\/$/, "");

  return {
    openapi: "3.1.0",
    info: {
      title: "Classy Teaching Assistant",
      version: "1.0.0",
      description:
        "Manage your classes, students, quizzes, notes, assignments, announcements, and grading directly from your AI assistant. All actions run securely within your personal Classy workspace.",
    },
    servers: [
      {
        url: `${baseUrl}/gpt/${token}/actions`,
        description: "Your Personal Classy Action Server",
      },
    ],
    paths: {
      "/list_batches": {
        post: {
          operationId: "list_batches",
          summary: "List all your classes/batches",
          description:
            "Lists all batches created by this tutor with student counts (joined and pending approval) and published item counts.",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {},
                },
              },
            },
          },
          responses: {
            "200": {
              description: "List of batches",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "array", items: { type: "object" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/create_batch": {
        post: {
          operationId: "create_batch",
          summary: "Create a new class or batch",
          description:
            "Creates a new class/batch, assigns a unique 6-character student join code, and produces an invite link.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: {
                      type: "string",
                      description: "The batch name (e.g. 'Class 10 Physics')",
                    },
                    subject: {
                      type: "string",
                      description: "Subject taught (e.g. 'Physics', 'Mathematics')",
                    },
                    grade: {
                      type: "string",
                      description: "Grade or class level (e.g. 'Class 10')",
                    },
                    description: {
                      type: "string",
                      description: "Short description of the batch",
                    },
                    premium_price_inr: {
                      type: "integer",
                      description: "Optional price in INR for premium content access (0 for free)",
                      default: 0,
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Batch created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/add_students": {
        post: {
          operationId: "add_students",
          summary: "Pre-approve / roster students into a batch",
          description:
            "Roster up to 200 students into a batch by name, email, or phone. Pre-approved students bypass pending queue upon joining.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["batch_id", "students"],
                  properties: {
                    batch_id: {
                      type: "string",
                      description: "ID of the target batch",
                    },
                    students: {
                      type: "array",
                      description: "List of students to add",
                      items: {
                        type: "object",
                        required: ["name"],
                        properties: {
                          name: { type: "string" },
                          email: { type: "string" },
                          phone: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Students added",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/get_invite_link": {
        post: {
          operationId: "get_invite_link",
          summary: "Get the student invite link for a batch",
          description: "Returns the 6-character join code, shareable URL, and WhatsApp share link for a batch.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["batch_id"],
                  properties: {
                    batch_id: { type: "string", description: "ID of the batch" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Invite link and join details",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/list_students": {
        post: {
          operationId: "list_students",
          summary: "List students in a batch roster",
          description: "List students in a batch filtered by status ('all', 'joined', 'pending', 'removed').",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["batch_id"],
                  properties: {
                    batch_id: { type: "string", description: "ID of the batch" },
                    status: {
                      type: "string",
                      enum: ["all", "joined", "pending", "removed"],
                      default: "all",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Roster student list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "array", items: { type: "object" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/approve_student": {
        post: {
          operationId: "approve_student",
          summary: "Approve, reject, or remove a student from roster",
          description: "Approve a pending student request, reject it, or remove an enrolled student.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["roster_id", "action"],
                  properties: {
                    roster_id: { type: "string", description: "ID of the roster entry" },
                    action: {
                      type: "string",
                      enum: ["approve", "reject", "remove"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Roster updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/publish_quiz": {
        post: {
          operationId: "publish_quiz",
          summary: "Publish an interactive multiple-choice quiz",
          description:
            "Publishes an interactive multiple-choice quiz with automatic scoring and explanations.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["batch_id", "title", "questions"],
                  properties: {
                    batch_id: { type: "string", description: "ID of the target batch" },
                    title: { type: "string", description: "Title of the quiz" },
                    instructions: { type: "string", description: "Instructions for students" },
                    access: {
                      type: "string",
                      enum: ["free", "premium"],
                      default: "free",
                    },
                    due_at: {
                      type: "string",
                      description: "ISO 8601 deadline timestamp",
                    },
                    questions: {
                      type: "array",
                      description: "List of quiz questions",
                      items: {
                        type: "object",
                        required: ["id", "prompt", "options", "correct_index"],
                        properties: {
                          id: { type: "string" },
                          prompt: { type: "string" },
                          options: {
                            type: "array",
                            items: { type: "string" },
                          },
                          correct_index: { type: "integer" },
                          explanation: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Quiz published",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/publish_notes": {
        post: {
          operationId: "publish_notes",
          summary: "Publish markdown study notes or lecture material",
          description:
            "Publishes revision notes or study material formatted in clean Markdown for students.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["batch_id", "title", "content_markdown"],
                  properties: {
                    batch_id: { type: "string", description: "Target batch ID" },
                    title: { type: "string", description: "Title of the notes" },
                    content_markdown: {
                      type: "string",
                      description: "Full content in Markdown format",
                    },
                    access: {
                      type: "string",
                      enum: ["free", "premium"],
                      default: "free",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Notes published",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/publish_assignment": {
        post: {
          operationId: "publish_assignment",
          summary: "Publish homework or an assignment requiring submission",
          description:
            "Publishes an assignment with maximum marks, instructions, and an optional deadline.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["batch_id", "title", "content_markdown"],
                  properties: {
                    batch_id: { type: "string", description: "Target batch ID" },
                    title: { type: "string", description: "Assignment title" },
                    content_markdown: {
                      type: "string",
                      description: "Assignment questions or instructions in Markdown",
                    },
                    max_marks: {
                      type: "integer",
                      description: "Maximum marks possible",
                      default: 10,
                    },
                    due_at: {
                      type: "string",
                      description: "ISO 8601 deadline timestamp",
                    },
                    access: {
                      type: "string",
                      enum: ["free", "premium"],
                      default: "free",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Assignment published",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/post_announcement": {
        post: {
          operationId: "post_announcement",
          summary: "Post an announcement to the batch stream",
          description:
            "Broadcast an announcement or class update to all enrolled students.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["batch_id", "title", "content_markdown"],
                  properties: {
                    batch_id: { type: "string", description: "Target batch ID" },
                    title: { type: "string", description: "Announcement headline" },
                    content_markdown: {
                      type: "string",
                      description: "Full announcement message",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Announcement posted",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/list_items": {
        post: {
          operationId: "list_items",
          summary: "List content items published in a batch",
          description:
            "List quizzes, notes, assignments, or announcements published in a batch.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["batch_id"],
                  properties: {
                    batch_id: { type: "string", description: "Target batch ID" },
                    type: {
                      type: "string",
                      enum: ["all", "quiz", "notes", "assignment", "announcement"],
                      default: "all",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "List of items",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "array", items: { type: "object" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/update_item": {
        post: {
          operationId: "update_item",
          summary: "Update or unpublish an item",
          description: "Modify an item's title, access tier ('free'/'premium'), or published status.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["item_id"],
                  properties: {
                    item_id: { type: "string", description: "Item ID" },
                    title: { type: "string" },
                    access: { type: "string", enum: ["free", "premium"] },
                    published: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Item updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/get_results": {
        post: {
          operationId: "get_results",
          summary: "View quiz analytics and per-question score breakdown",
          description:
            "Returns student attempt stats, average scores, and per-question accuracy to identify trouble areas.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["item_id"],
                  properties: {
                    item_id: { type: "string", description: "Quiz item ID" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Quiz analytics summary",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/list_submissions": {
        post: {
          operationId: "list_submissions",
          summary: "List student homework submissions for an assignment",
          description:
            "List student submissions filtered by status ('all', 'submitted', 'graded', 'returned').",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["item_id"],
                  properties: {
                    item_id: { type: "string", description: "Assignment item ID" },
                    status: {
                      type: "string",
                      enum: ["all", "submitted", "graded", "returned"],
                      default: "all",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "List of submissions",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "array", items: { type: "object" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/grade_submission": {
        post: {
          operationId: "grade_submission",
          summary: "Record marks and feedback for a student submission",
          description:
            "Assigns marks and constructive feedback to a submission, with an option to immediately release results to the student.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["submission_id", "marks"],
                  properties: {
                    submission_id: { type: "string", description: "Submission ID" },
                    marks: { type: "number", description: "Score to award" },
                    feedback: { type: "string", description: "Written feedback" },
                    release: {
                      type: "boolean",
                      description: "Whether to immediately release to the student",
                      default: false,
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Grading recorded",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}
