import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Flame } from "lucide-react";
import { Link } from "wouter";

interface ProjectCardProps {
  id: number;
  title: string;
  teacherName?: string;
  department?: string;
  researchField?: string;
  duration?: string;
  recruitCount?: number;
  currentCount?: number;
  matchScore?: number;
  requiredSkills?: string[];
  viewCount?: number;
  createdAt?: Date;
}

export function ProjectCard({
  id,
  title,
  teacherName,
  department,
  researchField,
  duration,
  recruitCount = 1,
  currentCount = 0,
  matchScore,
  requiredSkills = [],
  viewCount,
}: ProjectCardProps) {
  const getMatchScoreColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const getMatchScoreLabel = (score?: number) => {
    if (!score) return "待评估";
    if (score >= 80) return "高度匹配";
    if (score >= 60) return "较为匹配";
    return "一般匹配";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2 flex-1">{title}</h3>
          {matchScore !== undefined && (
            <Badge className={`${getMatchScoreColor(matchScore)} flex items-center gap-1 shrink-0`}>
              <Flame className="w-3 h-3" />
              {matchScore}%
            </Badge>
          )}
        </div>
        {teacherName && (
          <p className="text-sm text-muted-foreground">导师: {teacherName}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {department && (
            <Badge variant="outline" className="text-xs">
              {department}
            </Badge>
          )}
          {researchField && (
            <Badge variant="outline" className="text-xs">
              {researchField}
            </Badge>
          )}
        </div>

        {requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {requiredSkills.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {requiredSkills.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{requiredSkills.length - 4}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {duration && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{duration}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>
              {currentCount}/{recruitCount}人
            </span>
          </div>
          {viewCount !== undefined && (
            <span>{viewCount} 次浏览</span>
          )}
        </div>

        {matchScore !== undefined && matchScore >= 60 && (
          <div className="text-xs text-muted-foreground bg-accent/50 rounded p-2">
            <span className="font-medium text-accent-foreground">{getMatchScoreLabel(matchScore)}</span>
            {matchScore >= 80 && " - 您的技能与项目需求高度吻合"}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 gap-2">
        <Link href={`/projects/${id}`}>
          <Button variant="outline" className="flex-1">
            查看详情
          </Button>
        </Link>
        <Link href={`/projects/${id}/apply`}>
          <Button className="flex-1">一键申请</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
