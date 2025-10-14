import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary">
          Institution Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Rankings based on performance metrics and engagement
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Leaderboard Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We're building an exciting leaderboard system for institutions. This
            will showcase top-performing schools based on various metrics
            including student engagement, completion rates, and academic
            achievements.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Medal className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold">Academic Excellence</h3>
              <p className="text-sm text-muted-foreground">
                Top performing institutions
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Award className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold">Student Engagement</h3>
              <p className="text-sm text-muted-foreground">
                Highest participation rates
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">Growth Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Most improved institutions
              </p>
            </div>
          </div>

          <Badge variant="secondary" className="mt-4">
            Feature in Development
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
