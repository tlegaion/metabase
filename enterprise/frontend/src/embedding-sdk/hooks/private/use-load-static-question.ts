import { useMemo } from "react";

import { getParameterDependencyKey } from "embedding-sdk/lib/load-question-utils";
import { skipToken, useGetCardQuery, useGetCardQueryQuery } from "metabase/api";
import { getTemplateTagParametersFromCard } from "metabase-lib/v1/parameters/utils/template-tags";

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

  const hasSqlParameterValues =
    Object.keys(initialSqlParameters ?? {}).length > 0;

  const cardParameters = useMemo(() => {
    return card ? getTemplateTagParametersFromCard(card) : [];
  }, [card]);

  // Avoid re-running the query if the parameters haven't changed.
  const sqlParametersKey = getParameterDependencyKey(initialSqlParameters);

  const parameters = useMemo(
    () =>
      cardParameters
        .filter(parameter => parameter.target)
        .map(parameter => ({
          id: parameter.id,
          type: parameter.type,
          target: parameter.target,
          value: initialSqlParameters?.[parameter.slug],
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cardParameters, sqlParametersKey],
  );

  const isParametersLoaded = hasSqlParameterValues
    ? card && cardParameters.length > 0
    : true;

  const {
    data: queryResult,
    isLoading: isQueryResultLoading,
    error: queryResultError,
  } = useGetCardQueryQuery(
    questionId !== null && isParametersLoaded
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
