"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ExamRow {
  id: string;
  title: string;
  subject: string;
  type: string;
  price?: number;
  currency?: string;
  createdAt: string;
}

interface EnrollmentRow {
  id: string;
  examId: string;
  status: string;
}

export default function ExamTable({
  exams,
  enrollments,
  onEnroll,
}: {
  exams: any[];
  enrollments: EnrollmentRow[];
  onEnroll?: (exam: any) => void;
}) {
  const isEnrolled = (examId: string) =>
    enrollments.some((e) => e.examId === examId);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold">{exam.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(exam.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </TableCell>
              <TableCell>{exam.subject}</TableCell>
              <TableCell>{exam.type}</TableCell>
              <TableCell>
                {exam.price && exam.price > 0 ? (
                  <span>
                    {exam.currency || "NGN"} {exam.price}
                  </span>
                ) : (
                  <Badge>Free</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/exam/${exam.id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                  {isEnrolled(exam.id) ? (
                    <Link href={`/exam/${exam.id}`}>
                      <Button variant="secondary" size="sm">
                        Start
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" onClick={() => onEnroll?.(exam)}>
                      Enroll
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
