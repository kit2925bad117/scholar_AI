import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    };

    const buildUrl = (table: string, filter: string) =>
      `${supabaseUrl}/rest/v1/${table}?${filter}`;

    const [gradesRes, attendanceRes, submissionsRes, enrollmentsRes] =
      await Promise.all([
        fetch(buildUrl("grades", `student_id=eq.${userId}`), { headers }),
        fetch(buildUrl("attendance", `student_id=eq.${userId}`), { headers }),
        fetch(buildUrl("submissions", `student_id=eq.${userId}`), { headers }),
        fetch(buildUrl("enrollments", `student_id=eq.${userId}`), { headers }),
      ]);

    const grades = await gradesRes.json();
    const attendance = await attendanceRes.json();
    const submissions = await submissionsRes.json();
    const enrollments = await enrollmentsRes.json();

    const gradeData = grades as Record<string, unknown>[];
    const attendanceData = attendance as Record<string, unknown>[];
    const submissionData = submissions as Record<string, unknown>[];
    const enrollmentData = enrollments as Record<string, unknown>[];

    const avgGrade =
      gradeData.length > 0
        ? Math.round(
            gradeData.reduce(
              (sum: number, g) => sum + (g.score as number),
              0
            ) / gradeData.length
          )
        : 0;

    const presentCount = attendanceData.filter(
      (a) => a.status === "present"
    ).length;
    const attendanceRate =
      attendanceData.length > 0
        ? Math.round((presentCount / attendanceData.length) * 100)
        : 0;

    const submittedCount = submissionData.length;

    const riskLevel =
      avgGrade < 50 || attendanceRate < 60
        ? "high"
        : avgGrade < 65 || attendanceRate < 75
        ? "medium"
        : "low";

    const insights: {
      type: string;
      title: string;
      summary: string;
      risk_level: string;
      payload: Record<string, unknown>;
    }[] = [];

    insights.push({
      type: "performance",
      title: "Performance Analysis",
      summary: `Your overall average grade is ${avgGrade}%. You have completed ${enrollmentData.length} course(s) with ${submittedCount} assignment submission(s).`,
      risk_level: riskLevel,
      payload: {
        avgGrade,
        enrolledCourses: enrollmentData.length,
        submittedAssignments: submittedCount,
      },
    });

    if (riskLevel !== "low") {
      insights.push({
        type: "risk",
        title: "At-Risk Detection",
        summary:
          riskLevel === "high"
            ? `Your performance indicates high academic risk. Your average grade is ${avgGrade}% and attendance rate is ${attendanceRate}%. Immediate intervention is recommended.`
            : `Your performance indicates moderate academic risk. Consider improving your ${avgGrade < 65 ? "grades" : "attendance"} to stay on track.`,
        risk_level: riskLevel,
        payload: { avgGrade, attendanceRate, riskLevel },
      });
    }

    if (attendanceRate < 75 && attendanceData.length > 0) {
      insights.push({
        type: "recommendation",
        title: "Attendance Improvement",
        summary: `Your attendance rate is ${attendanceRate}%. Aim to attend at least 85% of sessions. Missing classes directly impacts your grades and understanding.`,
        risk_level: attendanceRate < 60 ? "high" : "medium",
        payload: {
          attendanceRate,
          presentCount,
          totalSessions: attendanceData.length,
        },
      });
    }

    insights.push({
      type: "recommendation",
      title: "Personalized Study Tips",
      summary:
        avgGrade >= 80
          ? "Excellent work! Continue using active recall and spaced repetition to maintain your high performance."
          : avgGrade >= 60
          ? "You're making good progress. Focus on reviewing weak areas and practicing past exam questions to boost your scores."
          : "Prioritize your core subjects. Use active recall techniques, break study sessions into smaller chunks, and seek help from your teachers.",
      risk_level: riskLevel,
      payload: { avgGrade, recommendation: "active_recall" },
    });

    for (const insight of insights) {
      await fetch(`${supabaseUrl}/rest/v1/ai_logs`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify({
          user_id: userId,
          type: insight.type,
          title: insight.title,
          summary: insight.summary,
          risk_level: insight.risk_level,
          payload: JSON.stringify(insight.payload),
        }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        metrics: {
          avgGrade,
          attendanceRate,
          riskLevel,
          submittedCount,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
