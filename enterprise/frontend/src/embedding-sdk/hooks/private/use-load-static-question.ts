import { useMemo } from "react";

import { getParameterDependencyKey } from "embedding-sdk/lib/load-question-utils";
import { skipToken, useGetCardQuery, useGetCardQueryQuery } from "metabase/api";

interface LoadStaticQuestionParams {
  questionId: number | null;
  initialSqlParameters?: Record<string, string | number>;
}

export function useLoadStaticQuestion({
  questionId,
  initialSqlParameters,
}: LoadStaticQuestionParams) {
  const {
    data: card,
    isLoading: isCardLoading,
    error: cardError,
  } = useGetCardQuery(questionId !== null ? { id: questionId } : skipToken);

  // Avoid re-running the query if the parameters haven't changed.
  const sqlParameterKey = getParameterDependencyKey(initialSqlParameters);

  const parameters = useMemo(
    () => {
      return (card?.parameters ?? [])
        .filter(parameter => parameter.target)
        .map(parameter => ({
          id: parameter.id,
          type: parameter.type,
          target: parameter.target!,
          value: initialSqlParameters?.[parameter.slug],
        }));
    },
    // sqlParameterKeys prevents "parameters" from changing every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [card?.parameters, sqlParameterKey],
  );

  const {
    data: queryResult,
    isLoading: isQueryResultLoading,
    error: queryResultError,
  } = useGetCardQueryQuery(
    questionId !== null
      ? { cardId: questionId, ...(parameters ? { parameters } : {}) }
      : skipToken,
  );

  return {
    card,
    queryResult,
    loading: isCardLoading || isQueryResultLoading,
    error: cardError || queryResultError,
    updateQuestion: () => {},
  };
}
