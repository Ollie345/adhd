"use client"

import React from "react"

/**
 * DomainProgress
 * Props:
 * - steps: Array<{ id: string, label: string, total: number, answered: number, state: 'completed' | 'current' | 'pending' }>
 */
const DomainProgress = ({ steps = [] }) => {
    return (
        <div className="w-full overflow-x-auto px-1">
            <div className="flex items-center justify-between min-w-[320px] sm:min-w-0">
                {steps.map((step, idx) => {
                    const isCompleted = step.state === "completed"
                    const isCurrent = step.state === "current"
                    const isPending = step.state === "pending"

                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className={`flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 text-[10px] sm:text-xs font-semibold transition-colors duration-300 ${isCompleted
                                        ? "bg-blue-600 border-blue-600 text-white"
                                        : isCurrent
                                            ? "border-blue-600 text-blue-700 bg-white ring-2 ring-blue-100"
                                            : "border-gray-300 text-gray-400 bg-white"
                                        }`}
                                    aria-current={isCurrent ? "step" : undefined}
                                    aria-label={`${step.label} step`}
                                >
                                    {isCompleted ? "✓" : idx + 1}
                                </div>
                                <div className={`mt-1 text-[10px] sm:text-[11px] whitespace-nowrap ${isCurrent ? "text-gray-900" : "text-gray-600"}`}>{step.label}</div>
                                <div className="text-[9px] sm:text-[10px] text-gray-500">{step.answered}/{step.total}</div>

                                {isCurrent && (
                                    <div className="mt-1 w-16 sm:w-20 h-1 rounded bg-gray-200 overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded transition-all duration-500 ease-out"
                                            style={{ width: `${Math.min(100, Math.round((step.answered / Math.max(1, step.total)) * 100))}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {idx < steps.length - 1 && (
                                <div
                                    className={`mx-2 h-0.5 sm:h-1 flex-1 rounded transition-colors duration-300 ${isCompleted ? "bg-blue-600" : isCurrent ? "bg-blue-300" : "bg-gray-200"
                                        }`}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default DomainProgress


